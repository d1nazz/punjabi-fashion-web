import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { isShopifyEnabled } from '@/config/commerce';
import { type Product, getProductById, isCatalogProduct } from '@/data/products';
import type { CartLineItem, PersistedCartLine, SelectedProductOptions } from '@/types/commerce';
import type { ShopifyCart } from '@/types/shopify';
import {
  addLinesToShopifyCart,
  createShopifyCart,
  getShopifyCart,
  removeShopifyCartLines,
  updateShopifyCartLines,
} from '@/services/shopify/cart';
import {
  resolveShopifyVariantForCart,
  ShopifyVariantResolutionError,
} from '@/services/shopify/variantResolution';
import { buildCartLineItem } from '@/utils/cartLine';
import { mapShopifyCartToCartLines } from '@/utils/shopifyCartMapper';
import { validateSelectedOptionsForCart } from '@/utils/productPurchase';

const STORAGE_KEY = 'punjabi-fashion-cart-v1';
const SHOPIFY_CART_STORAGE_KEY = 'punjabi-fashion-shopify-cart-id-v1';
const MAX_LINE_QTY = 50;

export type CartAddResult =
  | { ok: true; checkoutUrl?: string }
  | { ok: false; message: string };

export interface WishlistItem {
  product: Product;
}

function buildLine(product: Product, quantity: number, opts: SelectedProductOptions): CartLineItem {
  return buildCartLineItem(product, quantity, opts);
}

function readPersistedLines(): PersistedCartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as PersistedCartLine[];
  } catch {
    return [];
  }
}

function readShopifyCartId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHOPIFY_CART_STORAGE_KEY);
    if (!raw?.trim()) return null;
    return raw.trim();
  } catch {
    return null;
  }
}

function writeShopifyCartId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHOPIFY_CART_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

function clearShopifyCartIdStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SHOPIFY_CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function hydrateCart(saved: PersistedCartLine[]): CartLineItem[] {
  const rows: CartLineItem[] = [];
  for (const row of saved) {
    const productId = typeof row.productId === 'string' ? row.productId : '';
    const qty = typeof row.quantity === 'number' && Number.isFinite(row.quantity) ? Math.floor(row.quantity) : 0;
    if (!productId || qty < 1) continue;

    const product = getProductById(productId);
    if (!product || !isCatalogProduct(product)) continue;

    const opts: SelectedProductOptions = {
      size: String(row.selectedOptions?.size ?? ''),
      color: row.selectedOptions?.color,
      stitchingType: row.selectedOptions?.stitchingType,
    };
    const err = validateSelectedOptionsForCart(product, opts);
    if (err) continue;

    rows.push(buildLine(product, qty, opts));
  }
  return rows;
}

function serializeCart(lines: CartLineItem[]): PersistedCartLine[] {
  return lines.map((l) => ({
    productId: l.productId,
    quantity: l.quantity,
    selectedOptions: { ...l.selectedOptions },
  }));
}

function userFacingShopifyCartError(err: unknown): string {
  if (err instanceof ShopifyVariantResolutionError) return err.message;
  if (err instanceof Error && err.name === 'ShopifyVariantResolutionError') return err.message;
  return 'Could not update your cart. Please try again.';
}

function parseShopifySubtotal(cart: ShopifyCart): number {
  const raw = cart.cost?.subtotalAmount?.amount;
  const n = Number.parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : 0;
}

interface StoreContextType {
  cart: CartLineItem[];
  wishlist: WishlistItem[];
  searchQuery: string;
  addToCart: (
    product: Product,
    quantity: number,
    opts: SelectedProductOptions,
  ) => Promise<CartAddResult>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateCartQuantity: (lineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  setSearchQuery: (q: string) => void;
  cartTotal: number;
  cartCount: number;
  /** Shopify Storefront checkout URL when in Shopify mode */
  shopifyCheckoutUrl: string | undefined;
  shopifyCartError: string | null;
  clearShopifyCartError: () => void;
  isCartBusy: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const shopifyCartIdRef = useRef<string | null>(
    typeof window !== 'undefined' && isShopifyEnabled ? readShopifyCartId() : null,
  );
  const [cart, setCart] = useState<CartLineItem[]>(() => {
    if (typeof window === 'undefined') return [];
    if (isShopifyEnabled) return [];
    return hydrateCart(readPersistedLines());
  });
  const [shopifyCheckoutUrl, setShopifyCheckoutUrl] = useState<string | undefined>(undefined);
  const [shopifySubtotalFromApi, setShopifySubtotalFromApi] = useState<number | null>(null);
  const [shopifyCartError, setShopifyCartError] = useState<string | null>(null);
  const [isCartBusy, setIsCartBusy] = useState(false);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const applyShopifyCart = useCallback((full: ShopifyCart) => {
    setCart(mapShopifyCartToCartLines(full));
    setShopifyCheckoutUrl(full.checkoutUrl);
    setShopifySubtotalFromApi(parseShopifySubtotal(full));
    shopifyCartIdRef.current = full.id;
    writeShopifyCartId(full.id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isShopifyEnabled) return;
    let cancelled = false;
    void (async () => {
      const id = readShopifyCartId();
      shopifyCartIdRef.current = id;
      if (!id) {
        if (!cancelled) {
          setCart([]);
          setShopifyCheckoutUrl(undefined);
          setShopifySubtotalFromApi(null);
        }
        return;
      }
      try {
        const sc = await getShopifyCart(id);
        if (cancelled) return;
        if (!sc) {
          clearShopifyCartIdStorage();
          shopifyCartIdRef.current = null;
          setCart([]);
          setShopifyCheckoutUrl(undefined);
          setShopifySubtotalFromApi(null);
          return;
        }
        applyShopifyCart(sc);
      } catch {
        if (cancelled) return;
        clearShopifyCartIdStorage();
        shopifyCartIdRef.current = null;
        setCart([]);
        setShopifyCheckoutUrl(undefined);
        setShopifySubtotalFromApi(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyShopifyCart]);

  useEffect(() => {
    if (typeof window === 'undefined' || isShopifyEnabled) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeCart(cart)));
    } catch {
      // ignore quota / private mode
    }
  }, [cart]);

  const clearShopifyCartError = useCallback(() => setShopifyCartError(null), []);

  const addToCart = useCallback(
    async (product: Product, quantity: number, opts: SelectedProductOptions): Promise<CartAddResult> => {
      if (!isCatalogProduct(product)) {
        return { ok: false, message: 'This product is not available.' };
      }
      const qty = Math.floor(quantity);
      if (!Number.isFinite(qty) || qty < 1) {
        return { ok: false, message: 'Please choose a valid quantity.' };
      }
      if (qty > MAX_LINE_QTY) {
        return {
          ok: false,
          message: `For larger orders, please contact the store (max ${MAX_LINE_QTY} per line online).`,
        };
      }
      const err = validateSelectedOptionsForCart(product, opts);
      if (err) return { ok: false, message: err };

      if (!isShopifyEnabled) {
        const line = buildLine(product, qty, opts);
        setCart((prev) => {
          const existing = prev.find((i) => i.lineId === line.lineId);
          if (existing) {
            const nextQty = Math.min(MAX_LINE_QTY, existing.quantity + qty);
            return prev.map((i) => (i.lineId === line.lineId ? { ...i, quantity: nextQty } : i));
          }
          return [...prev, line];
        });
        return { ok: true };
      }

      setIsCartBusy(true);
      setShopifyCartError(null);
      try {
        const resolved = await resolveShopifyVariantForCart(product, opts);
        if (!resolved.availableForSale) {
          return { ok: false, message: 'This variant is currently unavailable.' };
        }

        let cartId = shopifyCartIdRef.current ?? readShopifyCartId();
        let full: ShopifyCart;
        if (!cartId) {
          full = await createShopifyCart([
            { merchandiseId: resolved.variantId, quantity: qty },
          ]);
          applyShopifyCart(full);
          return { ok: true, checkoutUrl: full.checkoutUrl };
        }

        full = await addLinesToShopifyCart(cartId, [
          { merchandiseId: resolved.variantId, quantity: qty },
        ]);
        applyShopifyCart(full);
        return { ok: true, checkoutUrl: full.checkoutUrl };
      } catch (e) {
        const msg = userFacingShopifyCartError(e);
        setShopifyCartError(msg);
        return { ok: false, message: msg };
      } finally {
        setIsCartBusy(false);
      }
    },
    [applyShopifyCart],
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!isShopifyEnabled) {
        setCart((prev) => prev.filter((i) => i.lineId !== lineId));
        return;
      }

      const cartId = shopifyCartIdRef.current ?? readShopifyCartId();
      if (!cartId) {
        setCart((prev) => prev.filter((i) => i.lineId !== lineId));
        return;
      }

      setIsCartBusy(true);
      setShopifyCartError(null);
      try {
        const full = await removeShopifyCartLines(cartId, [lineId]);
        applyShopifyCart(full);
      } catch (e) {
        setShopifyCartError(userFacingShopifyCartError(e));
      } finally {
        setIsCartBusy(false);
      }
    },
    [applyShopifyCart],
  );

  const updateCartQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      const qty = Math.floor(quantity);

      if (!isShopifyEnabled) {
        if (!Number.isFinite(qty) || qty < 1) {
          setCart((prev) => prev.filter((i) => i.lineId !== lineId));
          return;
        }
        const capped = Math.min(MAX_LINE_QTY, qty);
        setCart((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity: capped } : i)));
        return;
      }

      const cartId = shopifyCartIdRef.current ?? readShopifyCartId();
      if (!cartId) return;

      setIsCartBusy(true);
      setShopifyCartError(null);
      try {
        if (!Number.isFinite(qty) || qty < 1) {
          const full = await removeShopifyCartLines(cartId, [lineId]);
          applyShopifyCart(full);
          return;
        }
        const capped = Math.min(MAX_LINE_QTY, qty);
        const full = await updateShopifyCartLines(cartId, [{ id: lineId, quantity: capped }]);
        applyShopifyCart(full);
      } catch (e) {
        setShopifyCartError(userFacingShopifyCartError(e));
      } finally {
        setIsCartBusy(false);
      }
    },
    [applyShopifyCart],
  );

  const clearCart = useCallback(async () => {
    if (!isShopifyEnabled) {
      setCart([]);
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    const cartId = shopifyCartIdRef.current ?? readShopifyCartId();
    const lineIds = cart.map((c) => c.lineId);
    setIsCartBusy(true);
    setShopifyCartError(null);
    try {
      if (cartId && lineIds.length > 0) {
        await removeShopifyCartLines(cartId, lineIds);
      }
    } catch (e) {
      setShopifyCartError(userFacingShopifyCartError(e));
    } finally {
      setIsCartBusy(false);
    }

    clearShopifyCartIdStorage();
    shopifyCartIdRef.current = null;
    setCart([]);
    setShopifyCheckoutUrl(undefined);
    setShopifySubtotalFromApi(null);
  }, [cart]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) return prev.filter((i) => i.product.id !== product.id);
      return [...prev, { product }];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((i) => i.product.id === productId),
    [wishlist],
  );

  const cartTotal = useMemo(() => {
    if (isShopifyEnabled && shopifySubtotalFromApi != null) {
      return shopifySubtotalFromApi;
    }
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [cart, shopifySubtotalFromApi]);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        searchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setSearchQuery,
        cartTotal,
        cartCount,
        shopifyCheckoutUrl,
        shopifyCartError,
        clearShopifyCartError,
        isCartBusy,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
