/**
 * Maps frontend routes / category slugs to Shopify collection handles (Storefront API).
 * Only listed slugs load from Shopify when VITE_COMMERCE_BACKEND=shopify.
 */

/** Category URL slug (`/category/:slug`) → Shopify collection handle. */
export const CATEGORY_SLUG_TO_SHOPIFY_COLLECTION: Readonly<Record<string, string>> = {
  "punjabi-suits": "punjabi-suits",
  lehengas: "lehengas",
  "party-wear": "party-wear",
  "sharara-gharara": "sharara-gharara",
  "womens-kurtis": "womens-kurtis",
  blouses: "blouses",
  "kurta-pajama": "kurta-pajama",
  shararas: "sharara-gharara",
  bangles: "bangles",
  earrings: "earrings",
  necklaces: "necklaces",
  accessories: "accessories",
};

export const SHOPIFY_COLLECTION_NEW_ARRIVALS = "new-arrivals";
export const SHOPIFY_COLLECTION_READY_TO_SHIP = "ready-to-ship";
export const SHOPIFY_COLLECTION_BEST_SELLERS = "best-sellers";

export function getShopifyCollectionHandleForCategorySlug(
  slug: string | undefined,
): string | null {
  if (!slug?.trim()) return null;
  return CATEGORY_SLUG_TO_SHOPIFY_COLLECTION[slug] ?? null;
}
