import type { Product } from "@/data/products";
import { products as allLocalProducts } from "@/data/products";
import type { ShopifyProduct } from "@/types/shopify";
import productPlaceholder from "@/assets/product-punjabi-suit.jpg";

function isAbsoluteImageUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  return url.startsWith("https://") || url.startsWith("http://");
}

/**
 * Full local catalog including hidden rows (for image + metadata fallback by handle).
 */
export function findLocalProductByHandle(handle: string): Product | undefined {
  const h = handle.trim();
  if (!h) return undefined;
  return allLocalProducts.find((p) => p.slug === h);
}

/**
 * Match Shopify collection products to local `Product` rows by `handle === slug`.
 * - Prefers Shopify `featuredImage` when it is a public URL; otherwise keeps local images.
 * - Drops Shopify-only products with no local match (avoids cart/checkout mismatch).
 */
export function mergeShopifyCollectionProducts(
  nodes: (ShopifyProduct | null | undefined)[],
): Product[] {
  const out: Product[] = [];
  for (const node of nodes) {
    if (!node?.handle) continue;
    const merged = mergeShopifyProductWithLocal(node);
    if (merged) out.push(merged);
  }
  return out;
}

export function mergeShopifyProductWithLocal(
  node: ShopifyProduct,
): Product | null {
  const local = findLocalProductByHandle(node.handle);
  if (!local) return null;

  const shopifyUrl = node.featuredImage?.url?.trim();
  const useShopify = isAbsoluteImageUrl(shopifyUrl);

  const images =
    useShopify && shopifyUrl
      ? [shopifyUrl]
      : local.images?.length
        ? [...local.images]
        : [productPlaceholder];

  return {
    ...local,
    images,
  };
}
