import { shopifyStorefrontRequest } from "@/services/shopify/client";
import {
  COLLECTION_BY_HANDLE_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  SHOP_QUERY,
} from "@/services/shopify/queries";
import type {
  ShopifyCollection,
  ShopifyProduct,
} from "@/types/shopify";

export interface ShopifyShopPayload {
  name: string;
  primaryDomain?: { url?: string; host?: string } | null;
}

export async function getShopifyShop(): Promise<ShopifyShopPayload> {
  const data = await shopifyStorefrontRequest<{ shop: ShopifyShopPayload }>(
    SHOP_QUERY,
  );
  return data.shop;
}

export async function getShopifyProducts(
  first: number = 20,
): Promise<ShopifyProduct[]> {
  const data = await shopifyStorefrontRequest<{
    products: { edges?: { node: ShopifyProduct }[] | null };
  }>(PRODUCTS_QUERY, { first });

  const edges = data.products?.edges ?? [];
  return edges.map((e) => e.node);
}

export async function getShopifyProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  const data = await shopifyStorefrontRequest<{ product: ShopifyProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return data.product ?? null;
}

export async function getShopifyCollectionByHandle(
  handle: string,
  first: number = 24,
): Promise<ShopifyCollection | null> {
  const data = await shopifyStorefrontRequest<{
    collection: ShopifyCollection | null;
  }>(COLLECTION_BY_HANDLE_QUERY, { handle, first });
  return data.collection ?? null;
}
