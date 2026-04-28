import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { type Product, formatPrice } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.id);
  const isJewelryProduct = ['Earrings', 'Necklaces'].includes(product.subcategory ?? '') || product.category === 'necklaces';
  const imageFitClass = isJewelryProduct ? 'object-contain' : 'object-cover';

  return (
    <div className="group relative rounded-sm bg-[#FFFDF8] p-2 shadow-[0_1px_0_rgba(185,144,74,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(26,18,15,0.34)]">
      {/* Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="block aspect-[3/4] overflow-hidden bg-surface-image relative rounded-sm border border-[#E6D8C4] frame-luxury"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full ${imageFitClass} transition-transform duration-1000 ease-out group-hover:scale-[1.03]`}
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-[#3A1117]/90 backdrop-blur-sm text-cream text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1">New</span>
          )}
          {product.isReadyToShip && (
            <span className="bg-[#5C1B24]/90 backdrop-blur-sm text-cream text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1">Ready to Ship</span>
          )}
          {product.isBridal && (
            <span className="bg-gold/90 backdrop-blur-sm text-charcoal text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1">Bridal</span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#1A120F]/90 backdrop-blur-sm text-cream text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1">Best Seller</span>
          )}
          {product.isSale && (
            <span className="bg-destructive/90 backdrop-blur-sm text-cream text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1">
              {product.compareAtPrice ? `${Math.round((1 - product.price / product.compareAtPrice) * 100)}% Off` : 'Sale'}
            </span>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
          <div className="bg-oxblood/90 backdrop-blur-sm border-t border-gold/15">
            <Link to={`/product/${product.slug}`} className="flex items-center justify-center gap-2 text-ivory text-[10px] uppercase tracking-[0.15em] py-2.5 hover:bg-burgundy/30 transition-colors">
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
              View Details
            </Link>
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full border border-gold/10 flex items-center justify-center transition-all duration-300 ${
          wishlisted
            ? 'bg-[#5C1B24] backdrop-blur-sm text-[#F7F1E6]'
            : 'bg-[#FFFDF8]/90 backdrop-blur-sm text-[#1A120F]/55 opacity-0 group-hover:opacity-100 hover:text-[#5C1B24] hover:border-[#B9904A]/35'
        }`}
        aria-label="Add to wishlist"
      >
        <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
      </button>

      {/* Product Info */}
      <div className="px-1 pt-4 pb-2">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-heading text-[15px] md:text-base text-[#1A120F] hover:text-[#5C1B24] transition-colors leading-snug tracking-wide">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="font-body text-[13px] font-semibold text-[#1A120F] tracking-wide">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[12px] text-[#6F6257]/65 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        {product.fabric && (
          <p className="text-[11px] text-[#6F6257]/75 mt-1">{product.fabric}</p>
        )}
      </div>
    </div>
  );
}
