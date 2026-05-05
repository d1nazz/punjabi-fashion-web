import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { type Product, getProductById, isCatalogProduct } from '@/data/products';
import type { CartLineItem, PersistedCartLine, SelectedProductOptions } from '@/types/commerce';
import { buildCartLineItem } from '@/utils/cartLine';
import { validateSelectedOptionsForCart } from '@/utils/productPurchase';

const STORAGE_KEY = 'punjabi-fashion-cart-v1';
const MAX_LINE_QTY = 50;

export type CartAddResult =
  | { ok: true }
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

interface StoreContextType {
  cart: CartLineItem[];
  wishlist: WishlistItem[];
  searchQuery: string;
  addToCart: (product: Product, quantity: number, opts: SelectedProductOptions) => CartAddResult;
  removeFromCart: (lineId: string) => void;
  updateCartQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  setSearchQuery: (q: string) => void;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartLineItem[]>(() =>
    typeof window !== 'undefined' ? hydrateCart(readPersistedLines()) : [],
  );
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeCart(cart)));
    } catch {
      // ignore quota / private mode
    }
  }, [cart]);

  const addToCart = useCallback((product: Product, quantity: number, opts: SelectedProductOptions): CartAddResult => {
    if (!isCatalogProduct(product)) {
      return { ok: false, message: 'This product is not available.' };
    }
    const qty = Math.floor(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return { ok: false, message: 'Please choose a valid quantity.' };
    }
    if (qty > MAX_LINE_QTY) {
      return { ok: false, message: `For larger orders, please contact the store (max ${MAX_LINE_QTY} per line online).` };
    }
    const err = validateSelectedOptionsForCart(product, opts);
    if (err) return { ok: false, message: err };

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
  }, []);

  const removeFromCart = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateCartQuantity = useCallback((lineId: string, quantity: number) => {
    const qty = Math.floor(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      setCart((prev) => prev.filter((i) => i.lineId !== lineId));
      return;
    }
    const capped = Math.min(MAX_LINE_QTY, qty);
    setCart((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity: capped } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore quota / private mode
    }
  }, []);

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

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
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
