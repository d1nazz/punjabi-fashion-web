/** Client-safe commerce types (browser bundle). Secrets never belong here. */

export type CurrencyCode = 'CAD';

export type AvailabilityState = 'in_stock' | 'available_in_store_online';

export interface SelectedProductOptions {
  size: string;
  /** Populated only when product.colorOptions lists multiple selectable colours */
  color?: string;
  stitchingType?: string;
}

/** Normalized cart row used in React state */
export interface CartLineItem {
  /** Stable id for merges + qty updates + removals */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  sku: string;
  image?: string;
  quantity: number;
  selectedOptions: SelectedProductOptions;
}

/** Persisted snapshot (minimal) — hydrate from catalog after load */
export interface PersistedCartLine {
  productId: string;
  quantity: number;
  selectedOptions: SelectedProductOptions;
}

/** POST body to /.netlify/functions/create-checkout-session */
export interface CheckoutLineRequest {
  productId: string;
  quantity: number;
  selectedOptions: SelectedProductOptions;
}

export interface CheckoutRequestBody {
  items: CheckoutLineRequest[];
}

export interface CheckoutResponseOk {
  url: string;
}

export interface CheckoutResponseErr {
  error: string;
}
