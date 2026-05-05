/**
 * Storefront display + cart math. Must stay aligned with server cents in
 * `netlify/functions/create-checkout-session.ts` (34000 / 1500).
 */
export const FREE_SHIPPING_THRESHOLD_CAD = 340;
export const STANDARD_SHIPPING_CAD = 15;
