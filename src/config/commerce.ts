/**
 * Commerce backend selection. Defaults preserve the current local catalog + Stripe checkout.
 * Opt-in to Shopify only via VITE_COMMERCE_BACKEND=shopify (and valid Storefront env).
 */

export type CommerceBackend = "local-stripe" | "shopify";

const VALID_BACKENDS: readonly CommerceBackend[] = ["local-stripe", "shopify"];

function normalizeBackend(raw: string | undefined): CommerceBackend {
  if (raw == null || String(raw).trim() === "") {
    return "local-stripe";
  }
  const v = String(raw).trim() as CommerceBackend;
  if (VALID_BACKENDS.includes(v)) {
    return v;
  }
  return "local-stripe";
}

export const COMMERCE_BACKEND: CommerceBackend = normalizeBackend(
  import.meta.env.VITE_COMMERCE_BACKEND as string | undefined,
);

export const isShopifyEnabled: boolean = COMMERCE_BACKEND === "shopify";
