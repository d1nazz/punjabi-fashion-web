import type { CurrencyCode } from "@/types/commerce";
import type {
  ShopifyImage,
  ShopifyProduct,
  ShopifyVariant,
} from "@/types/shopify";

/**
 * Card/list UI shape — not the full local `Product` from `products.ts`.
 * Use this until Shopify merchandising matches the legacy catalog fields.
 */
export interface StorefrontProductCardData {
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string | null;
  price?: number;
  currency: CurrencyCode;
  compareAtPrice?: number;
}

export interface StorefrontProductDetailData extends StorefrontProductCardData {
  descriptionHtml?: string | null;
  options: { name: string; values: string[] }[];
  variants: ShopifyVariant[];
}

function parseAmount(amount: string | undefined): number | undefined {
  if (amount == null || amount === "") return undefined;
  const n = Number.parseFloat(amount);
  return Number.isFinite(n) ? n : undefined;
}

function coerceCurrency(code: string | undefined): CurrencyCode {
  if (code === "CAD") return "CAD";
  return "CAD";
}

export function getProductHandleFromShopifyProduct(product: ShopifyProduct): string {
  return product.handle;
}

export function getShopifyProductPrimaryImage(
  product: ShopifyProduct,
): ShopifyImage | null {
  if (product.featuredImage?.url) {
    return product.featuredImage;
  }
  const first = product.images?.edges?.[0]?.node;
  if (first?.url) return first;
  return null;
}

export function getShopifyVariantPrice(variant: ShopifyVariant): {
  amount: number;
  currencyCode: CurrencyCode;
} | null {
  const amount = parseAmount(variant.price?.amount);
  if (amount == null) return null;
  return {
    amount,
    currencyCode: coerceCurrency(variant.price?.currencyCode),
  };
}

export function getAvailableVariantOptions(product: ShopifyProduct): {
  name: string;
  values: string[];
}[] {
  return (product.options ?? []).map((o) => ({
    name: o.name,
    values: o.values ?? [],
  }));
}

function variantsFromProduct(product: ShopifyProduct): ShopifyVariant[] {
  const edges = product.variants?.edges;
  if (!edges) return [];
  return edges.map((e) => e.node).filter((n): n is ShopifyVariant => Boolean(n?.id));
}

/**
 * Preview mapping for grids/cards. Does not produce the full legacy `Product` type.
 */
export function mapShopifyProductToCatalogProductPreview(
  product: ShopifyProduct,
): StorefrontProductCardData {
  const img = getShopifyProductPrimaryImage(product);
  const minFromRange = parseAmount(
    product.priceRange?.minVariantPrice?.amount,
  );
  const variants = variantsFromProduct(product);
  const firstVariantPrice =
    variants[0] != null ? getShopifyVariantPrice(variants[0]) : null;
  const firstPrice = firstVariantPrice?.amount ?? minFromRange;
  const currency = coerceCurrency(
    product.priceRange?.minVariantPrice?.currencyCode ??
      variants[0]?.price?.currencyCode,
  );

  return {
    handle: product.handle,
    title: product.title,
    imageUrl: img?.url ?? undefined,
    imageAlt: img?.altText ?? null,
    price: firstPrice ?? minFromRange,
    currency,
  };
}

export function mapShopifyProductToDetailData(
  product: ShopifyProduct,
): StorefrontProductDetailData {
  const base = mapShopifyProductToCatalogProductPreview(product);
  return {
    ...base,
    descriptionHtml: product.descriptionHtml ?? null,
    options: getAvailableVariantOptions(product),
    variants: variantsFromProduct(product),
  };
}
