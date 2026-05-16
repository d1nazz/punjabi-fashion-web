import { useQuery } from "@tanstack/react-query";
import { isShopifyEnabled } from "@/config/commerce";
import { getShopifyCollectionByHandle } from "@/services/shopify/products";
import type { ShopifyProduct } from "@/types/shopify";
import { mergeShopifyCollectionProducts } from "@/utils/shopifyLocalMerge";

const COLLECTION_PRODUCT_LIMIT = 250;

/**
 * Fetches collection products from Shopify when enabled; consumer should fall back to local list on error/empty.
 */
export function useShopifyCollectionProducts(collectionHandle: string | null) {
  const trimmed = collectionHandle?.trim() ?? "";
  const enabled = isShopifyEnabled && trimmed !== "";

  return useQuery({
    queryKey: ["shopify-collection-products", trimmed],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const col = await getShopifyCollectionByHandle(
        trimmed,
        COLLECTION_PRODUCT_LIMIT,
      );
      if (!col) {
        throw new Error("Collection not found");
      }
      const nodes =
        col.products?.edges
          ?.map((e) => e?.node)
          .filter((n): n is ShopifyProduct => Boolean(n?.handle)) ?? [];
      return mergeShopifyCollectionProducts(nodes);
    },
  });
}
