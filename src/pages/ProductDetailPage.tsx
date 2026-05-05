import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Minus, Plus, Truck, RotateCcw, Shield, Calendar, Phone, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import { catalogProducts, getProductBySlug, formatPrice } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import { businessInfo } from '@/data/businessInfo';
import type { SelectedProductOptions } from '@/types/commerce';
import { startStripeCheckoutSession } from '@/services/checkout';
import { buildCartLineItem } from '@/utils/cartLine';
import {
  productRequiresColorChoice,
  productRequiresExplicitSize,
  productRequiresStitchingChoice,
} from '@/utils/productPurchase';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStitching, setSelectedStitching] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'care'>('description');
  const [pdpActionError, setPdpActionError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  useEffect(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSelectedStitching('');
    setQuantity(1);
    setPdpActionError(null);
    setBuyNowLoading(false);
    setAddLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!product?.id) return;
    const cOpts = product.colorOptions;
    if (cOpts?.length === 1) {
      setSelectedColor(cOpts[0]);
    } else {
      setSelectedColor('');
    }
    const sOpts = product.stitchingOptions;
    if (sOpts?.length === 1) {
      setSelectedStitching(sOpts[0]);
    } else {
      setSelectedStitching('');
    }
  }, [product?.id]);

  if (!product) {
    return <Layout><div className="container py-24 text-center"><div className="divider-ornament mb-6"><span className="text-gold/30 text-[8px]">◆</span></div><h1 className="font-heading text-3xl">Product Not Found</h1></div></Layout>;
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = catalogProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const isJewelryProduct = ['Bangles', 'Earrings', 'Necklaces'].includes(product.subcategory ?? '') || ['bangles', 'necklaces'].includes(product.category);
  const imageFitClass = isJewelryProduct ? 'object-contain' : 'object-cover';

  const buildSelections = (): SelectedProductOptions => {
    const autoSize =
      product.sizes.length === 1
        ? product.sizes[0]
        : selectedSize.trim();
    const color =
      productRequiresColorChoice(product)
        ? selectedColor.trim()
        : undefined;
    const stitching =
      productRequiresStitchingChoice(product)
        ? selectedStitching.trim()
        : undefined;
    return {
      size: autoSize,
      ...(color ? { color } : {}),
      ...(stitching ? { stitchingType: stitching } : {}),
    };
  };

  const handleAddToCart = () => {
    setPdpActionError(null);
    if (!product.inStock) {
      setPdpActionError('This piece is currently unavailable.');
      return;
    }
    if (quantity < 1 || quantity > 50) {
      setPdpActionError('Please choose between 1 and 50.');
      return;
    }
    if (productRequiresExplicitSize(product) && !selectedSize) {
      setPdpActionError('Please select a size before adding to cart.');
      return;
    }
    if (productRequiresColorChoice(product) && !selectedColor.trim()) {
      setPdpActionError('Please select a colour before adding to cart.');
      return;
    }
    if (productRequiresStitchingChoice(product) && !selectedStitching.trim()) {
      setPdpActionError('Please select a stitching option before adding to cart.');
      return;
    }

    const opts = buildSelections();
    setAddLoading(true);
    const res = addToCart(product, quantity, opts);
    setAddLoading(false);
    if (!res.ok) {
      setPdpActionError(res.message);
    }
  };

  const handleBuyNow = async () => {
    setPdpActionError(null);
    if (!product.inStock) {
      setPdpActionError('This piece is currently unavailable.');
      return;
    }
    if (quantity < 1 || quantity > 50) {
      setPdpActionError('Please choose between 1 and 50.');
      return;
    }
    if (productRequiresExplicitSize(product) && !selectedSize) {
      setPdpActionError('Please select a size before continuing to checkout.');
      return;
    }
    if (productRequiresColorChoice(product) && !selectedColor.trim()) {
      setPdpActionError('Please select a colour before continuing to checkout.');
      return;
    }
    if (productRequiresStitchingChoice(product) && !selectedStitching.trim()) {
      setPdpActionError('Please select a stitching option before continuing to checkout.');
      return;
    }

    if (buyNowLoading) return;

    const opts = buildSelections();
    const line = buildCartLineItem(product, quantity, opts);

    setBuyNowLoading(true);
    const result = await startStripeCheckoutSession([line]);
    setBuyNowLoading(false);
    if ('error' in result) {
      setPdpActionError(result.error);
      return;
    }
    window.location.assign(result.url);
  };

  const availabilityLabel = !product.inStock
    ? 'Currently unavailable for online checkout.'
    : product.availability === 'available_in_store_online'
      ? 'Available online and in boutique (subject to stock).'
      : 'In stock for online checkout (subject to final confirmation).';

  return (
    <Layout>
      <div className="container py-3">
        <Breadcrumbs items={[
          { name: product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), path: `/category/${product.category}` },
          { name: product.name },
        ]} />
      </div>

      <div className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-[3/4] overflow-hidden bg-surface-image relative group rounded-sm border border-gold/10">
              <img src={product.images[0]} alt={product.name} className={`w-full h-full ${imageFitClass} transition-transform duration-700 group-hover:scale-[1.03]`} />
              {/* Sale badge */}
              {product.isSale && product.compareAtPrice && (
                <div className="absolute top-4 left-4 bg-destructive/90 backdrop-blur-sm text-cream text-[9px] font-semibold uppercase tracking-[0.15em] px-3 py-1.5">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </div>
              )}
            </div>
            {/* Thumbnail row placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[0,1,2,3].map(i => (
                <div key={i} className={`aspect-[3/4] overflow-hidden bg-surface-image cursor-pointer border-2 ${i === 0 ? 'border-gold/40' : 'border-transparent hover:border-gold/20'} transition-colors`}>
                  <img src={product.images[0]} alt="" className={`w-full h-full ${imageFitClass} opacity-90`} />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:py-4">
            <h1 className="heading-editorial text-foreground text-2xl md:text-3xl lg:text-[2.25rem] mb-2">{product.name}</h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {(product.subcategory ?? product.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}{' '}
              · SKU {product.sku} · {product.currency ?? 'CAD'}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4 mt-4 pb-4 border-b border-border">
              <span className="font-heading text-2xl text-foreground">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-[14px] text-muted-foreground/50 line-through">{formatPrice(product.compareAtPrice)}</span>
                  <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 uppercase tracking-wider font-semibold">
                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% Off
                  </span>
                </>
              )}
            </div>

            <p className="text-[12px] leading-relaxed text-muted-foreground/90 mb-4">{availabilityLabel}</p>

            <p className="text-muted-foreground font-body text-[14px] leading-relaxed mb-6">{product.description}</p>

            {/* Colour selector */}
            {productRequiresColorChoice(product) && (
              <div className="mb-6">
                <h3 className="label-luxury text-foreground mb-3">Select Colour</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colorOptions!.map((c) => (
                    <button key={c} type="button" onClick={() => setSelectedColor(c)}
                      className={`min-h-[44px] min-w-[48px] px-4 border text-[12px] tracking-wide transition-all duration-300 ${
                        selectedColor === c
                          ? 'border-gold bg-gold/10 text-gold-dark font-semibold'
                          : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                {!selectedColor && (
                  <p className="text-[11px] text-muted-foreground/50 mt-2">Please select a colour to continue</p>
                )}
              </div>
            )}

            {/* Stitching selector */}
            {productRequiresStitchingChoice(product) && (
              <div className="mb-6">
                <h3 className="label-luxury text-foreground mb-3">Tailoring Option</h3>
                <div className="flex flex-wrap gap-2">
                  {product.stitchingOptions!.map((st) => (
                    <button key={st} type="button" onClick={() => setSelectedStitching(st)}
                      className={`min-h-[44px] min-w-[48px] px-4 border text-[12px] tracking-wide transition-all duration-300 ${
                        selectedStitching === st
                          ? 'border-gold bg-gold/10 text-gold-dark font-semibold'
                          : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
                      }`}>
                      {st}
                    </button>
                  ))}
                </div>
                {!selectedStitching && (
                  <p className="text-[11px] text-muted-foreground/50 mt-2">Please select tailoring to continue</p>
                )}
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="label-luxury text-foreground">Select Size</h3>
                  <Link to="/size-guide" className="text-[11px] text-gold hover:underline tracking-wide">Size Guide</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} type="button" onClick={() => setSelectedSize(s)}
                      className={`min-h-[44px] min-w-[48px] h-11 px-4 border text-[12px] tracking-wide transition-all duration-300 ${
                        selectedSize === s
                          ? 'border-gold bg-gold/10 text-gold-dark font-semibold'
                          : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
                {!selectedSize && product.sizes.length > 1 && (
                  <p className="text-[11px] text-muted-foreground/50 mt-2">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* Quantity + actions */}
            {pdpActionError && (
              <p className="mb-3 text-[13px] text-[#8A1F2D]" role="alert">{pdpActionError}</p>
            )}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-stretch">
              <div className="flex shrink-0 items-center justify-center border border-border sm:h-auto">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={buyNowLoading || addLoading || !product.inStock} className="p-3 hover:bg-muted/50 transition-colors disabled:opacity-40">
                  <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <span className="px-5 text-[13px] font-body font-semibold min-w-[40px] text-center">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(50, quantity + 1))} disabled={buyNowLoading || addLoading || !product.inStock} className="p-3 hover:bg-muted/50 transition-colors disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <button type="button" onClick={handleAddToCart} disabled={addLoading || buyNowLoading || !product.inStock}
                className="btn-luxury btn-luxury-gold flex-1 shrink min-h-[52px] py-3.5 disabled:pointer-events-none disabled:opacity-50">
                {addLoading ? 'Adding…' : 'Add to Cart'}
              </button>
              <button type="button" onClick={handleBuyNow} disabled={buyNowLoading || addLoading || !product.inStock}
                className="btn-luxury border border-[#5C1B24]/35 bg-transparent text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C1B24] flex-1 shrink min-h-[52px] py-3.5 transition-colors hover:bg-[#5C1B24]/06 disabled:pointer-events-none disabled:opacity-50">
                {buyNowLoading ? 'Redirecting…' : 'Buy Now'}
              </button>
            </div>

            {/* Wishlist */}
            <button onClick={() => toggleWishlist(product)}
              className={`w-full py-3 border text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 mb-8 ${
                wishlisted
                  ? 'border-destructive/30 text-destructive bg-destructive/5'
                  : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
              }`}>
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
              {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Trust Bar */}
            <div className="grid grid-cols-3 gap-3 py-6 border-t border-b border-border mb-8">
              <div className="text-center">
                <Truck className="w-4 h-4 mx-auto mb-1.5 text-gold" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground leading-tight block">Canada-Wide<br />Shipping</span>
              </div>
              <div className="text-center">
                <RotateCcw className="w-4 h-4 mx-auto mb-1.5 text-gold" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground leading-tight block">14-Day<br />Returns</span>
              </div>
              <div className="text-center">
                <Shield className="w-4 h-4 mx-auto mb-1.5 text-gold" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground leading-tight block">Secure<br />Checkout</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex gap-0 border-b border-border mb-5">
                {(['description', 'details', 'care'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-4 text-[11px] uppercase tracking-[0.12em] transition-colors relative ${
                      activeTab === tab ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                    {tab === 'description' ? 'Description' : tab === 'details' ? 'Details' : 'Care'}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold" />}
                  </button>
                ))}
              </div>

              {activeTab === 'description' && (
                <div className="text-[13px] text-muted-foreground leading-relaxed space-y-3">
                  <p>{product.description}</p>
                  {product.occasion.length > 0 && (
                    <p><span className="text-foreground font-medium">Perfect for:</span> {product.occasion.join(', ')}</p>
                  )}
                </div>
              )}
              {activeTab === 'details' && (
                <div className="space-y-2.5 text-[13px]">
                  {product.sku && <div className="flex"><span className="w-32 text-muted-foreground/60">SKU</span><span className="text-foreground">{product.sku}</span></div>}
                  {product.fabric && <div className="flex"><span className="w-32 text-muted-foreground/60">Fabric</span><span className="text-foreground">{product.fabric}</span></div>}
                  {product.color && <div className="flex"><span className="w-32 text-muted-foreground/60">Colour</span><span className="text-foreground">{product.color}</span></div>}
                  {product.embellishment && <div className="flex"><span className="w-32 text-muted-foreground/60">Embellishment</span><span className="text-foreground">{product.embellishment}</span></div>}
                  {product.lining && <div className="flex"><span className="w-32 text-muted-foreground/60">Lining</span><span className="text-foreground">{product.lining}</span></div>}
                  {product.fitNotes && <div className="flex"><span className="w-32 text-muted-foreground/60">Fit</span><span className="text-foreground">{product.fitNotes}</span></div>}
                </div>
              )}
              {activeTab === 'care' && (
                <div className="text-[13px] text-muted-foreground">
                  <p>{product.care || 'Dry clean only. Store in a cool, dry place. Keep away from direct sunlight.'}</p>
                </div>
              )}
            </div>

            {/* Need Help? */}
            <div className="bg-champagne/60 p-5 border border-border">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="font-heading text-base text-foreground mb-1">Need Styling Help?</h4>
                  <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">
                    Our stylists can help you choose the perfect outfit, suggest complementary pieces, or arrange a private fitting at our Brampton boutique.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/book-appointment" className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors">
                      <Calendar className="w-3 h-3" /> Book Appointment
                    </Link>
                    <span className="text-muted-foreground/30">|</span>
                    <a href={businessInfo.phone.href} className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold hover:text-gold-dark transition-colors">
                      <Phone className="w-3 h-3" /> {businessInfo.phone.display}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border">
            <div className="text-center mb-10">
              <p className="label-editorial mb-2">Complete the Look</p>
              <h2 className="heading-editorial text-foreground">You May Also Love</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
