import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { catalogProducts, formatPrice, isCatalogProduct, type Product } from '@/data/products';
import { startStripeCheckoutSession } from '@/services/checkout';
import { validateCartForCheckout } from '@/services/checkoutValidation';
import { optionsSummary } from '@/utils/cartLine';
import { productAllowsQuickAdd } from '@/utils/productPurchase';

const FREE_SHIPPING_THRESHOLD = 340;

type CartContentProps = {
  onNavigate?: () => void;
  className?: string;
};

const isAccessoryProduct = (product: Product) => {
  const values = [product.category, product.subcategory, ...product.tags]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().replace(/&/g, '').replace(/\s+/g, '-'));

  return values.some((value) => ['accessories', 'bangles', 'earrings', 'necklaces', 'jewelry'].includes(value));
};

const isJewelryProduct = (product: Product) =>
  ['Bangles', 'Earrings', 'Necklaces'].includes(product.subcategory ?? '') ||
  ['bangles', 'necklaces', 'earrings'].includes(product.category);

export default function CartContent({ onNavigate, className = '' }: CartContentProps) {
  const { cart, addToCart, removeFromCart, updateCartQuantity } = useStore();
  const visibleCart = cart.filter((item) =>
    catalogProducts.some((p) => p.id === item.productId && isCatalogProduct(p)),
  );

  const subtotal = visibleCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = visibleCart.reduce((sum, item) => sum + item.quantity, 0);
  const amountAway = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const cartProductIds = new Set(visibleCart.map((item) => item.productId));

  const suggestedProducts = Array.from(
    new Map(
      [
        ...catalogProducts.filter((product) => isAccessoryProduct(product) && !cartProductIds.has(product.id)),
        ...catalogProducts.filter((product) => product.isNew && !cartProductIds.has(product.id)),
      ].map((product) => [product.id, product]),
    ).values(),
  ).slice(0, 4);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [suggestAddError, setSuggestAddError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setCheckoutError(null);
    const guard = validateCartForCheckout(visibleCart);
    if (guard) {
      setCheckoutError(guard);
      return;
    }
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    const result = await startStripeCheckoutSession(visibleCart);
    setCheckoutLoading(false);
    if ('error' in result) {
      setCheckoutError(result.error);
      return;
    }
    window.location.assign(result.url);
  };

  if (visibleCart.length === 0) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#D9C8AA] bg-[#FBF7EF]">
            <ShoppingBag className="h-5 w-5 text-[#B9904A]" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h3 className="font-heading text-2xl text-[#3A1117]">Your cart is empty</h3>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[#6F6257]">
            Explore our collections and add your favourite pieces.
          </p>
          <Link to="/women" onClick={onNavigate} className="btn-luxury btn-luxury-gold mt-7 w-full max-w-[260px]">
            Explore Collections
          </Link>
          <Link
            to="/new-arrivals"
            onClick={onNavigate}
            className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C1B24] hover:text-[#B9904A]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="border-b border-[#E6D8C4] bg-[#FFFDF8] px-5 py-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="font-semibold text-[#3A1117]">Subtotal</span>
          <span className="font-heading text-lg text-[#1A120F]">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#6F6257]">Taxes and shipping calculated at checkout.</p>
        <div className="mt-4 rounded-sm border border-[#E6D8C4] bg-[#FBF7EF] p-3">
          <p className="text-[12px] text-[#5C1B24]">
            {amountAway > 0
              ? `You are ${formatPrice(amountAway)} away from free shipping.`
              : 'You qualify for free shipping.'}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6D8C4]">
            <div
              className="h-full rounded-full bg-[#B9904A] transition-[width] duration-300"
              style={{ width: `${freeShippingProgress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {visibleCart.map((item) => {
            const product = catalogProducts.find((p) => p.id === item.productId);
            const imageFitClass = product && isJewelryProduct(product) ? 'object-contain' : 'object-cover';
            const optLabel = optionsSummary(item.selectedOptions);

            return (
              <div
                key={item.lineId}
                className="flex gap-3 border-b border-[#E6D8C4] pb-4 last:border-b-0"
              >
                <Link
                  to={`/product/${item.slug}`}
                  onClick={onNavigate}
                  className="h-[120px] w-24 flex-none overflow-hidden border border-[#E6D8C4] bg-[#FFFDF8]"
                >
                  {item.image && (
                    <img src={item.image} alt={item.name} className={`h-full w-full ${imageFitClass}`} />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={onNavigate}
                    className="line-clamp-2 font-heading text-[15px] leading-snug text-[#1A120F] hover:text-[#5C1B24]"
                  >
                    {item.name}
                  </Link>
                  {optLabel && <p className="mt-1 text-[11px] text-[#6F6257]">{optLabel}</p>}
                  <p className="mt-1.5 text-[13px] font-semibold text-[#1A120F]">{formatPrice(item.price)}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex h-9 items-center border border-[#D8C8AE] bg-[#FFFDF8]">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                        className="flex h-9 w-9 items-center justify-center text-[#3A1117] hover:bg-[#F4E8D8]"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="min-w-8 text-center text-[13px] font-semibold text-[#1A120F]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.lineId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center text-[#3A1117] hover:bg-[#F4E8D8]"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.lineId)}
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A1F2D] hover:text-[#B9904A]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {suggestedProducts.length > 0 && (
          <section className="mt-6 border-t border-[#E6D8C4] pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-lg text-[#3A1117]">Complete the look</h3>
              <span className="text-[11px] text-[#6F6257]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            {suggestAddError && (
              <p className="mb-2 text-[11px] text-[#8A1F2D]" role="alert">
                {suggestAddError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {suggestedProducts.map((product) => {
                const imageFitClass = isJewelryProduct(product) ? 'object-contain' : 'object-cover';
                const quick = productAllowsQuickAdd(product);

                const defaultSize =
                  Array.isArray(product.sizes) && product.sizes.length >= 1 ? product.sizes[0] ?? 'One Size' : 'One Size';

                return (
                  <div key={product.id} className="border border-[#E6D8C4] bg-[#FFFDF8] p-2">
                    <Link to={`/product/${product.slug}`} onClick={onNavigate} className="block h-24 overflow-hidden bg-[#FBF7EF]">
                      <img src={product.images[0]} alt={product.name} className={`h-full w-full ${imageFitClass}`} />
                    </Link>
                    <p className="mt-2 line-clamp-1 text-[10px] uppercase tracking-[0.12em] text-[#6F6257]">
                      {product.subcategory ?? product.category}
                    </p>
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onNavigate}
                      className="mt-1 line-clamp-2 min-h-[34px] text-[12px] leading-snug text-[#1A120F] hover:text-[#5C1B24]"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold text-[#1A120F]">{formatPrice(product.price)}</span>
                      {quick ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSuggestAddError(null);
                            const res = addToCart(product, 1, { size: defaultSize });
                            if (!res.ok) setSuggestAddError(res.message);
                          }}
                          className="border border-[#B9904A]/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C1B24] hover:bg-[#5C1B24] hover:text-[#FFFDF8]"
                        >
                          Add
                        </button>
                      ) : (
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={onNavigate}
                          className="border border-[#5C1B24]/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C1B24] hover:border-[#B9904A]/45"
                        >
                          Options
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-[#E6D8C4] bg-[#FFFDF8] px-5 py-4 shadow-[0_-14px_34px_-28px_rgba(26,18,15,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#3A1117]">Subtotal</span>
          <span className="font-heading text-xl text-[#1A120F]">{formatPrice(subtotal)}</span>
        </div>
        {checkoutError && (
          <p className="mb-3 text-center text-[12px] leading-relaxed text-[#8A1F2D]" role="alert">
            {checkoutError}
          </p>
        )}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading || visibleCart.length === 0}
          className="btn-luxury btn-luxury-gold w-full py-3.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {checkoutLoading ? 'Starting checkout…' : 'Checkout'}
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-[#6F6257]">
          Taxes and shipping calculated at checkout.
        </p>
      </div>
    </div>
  );
}
