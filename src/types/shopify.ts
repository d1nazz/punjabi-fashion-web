/**
 * Lean Storefront API–shaped types for GraphQL responses.
 * Fields are optional where queries may omit them.
 */

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  id?: string;
  url?: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title?: string;
  availableForSale?: boolean;
  sku?: string | null;
  selectedOptions?: ShopifySelectedOption[];
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  image?: ShopifyImage | null;
}

export interface ShopifyProductOption {
  name: string;
  values: string[];
}

export interface ShopifyProduct {
  id?: string;
  handle: string;
  title: string;
  productType?: string | null;
  description?: string | null;
  descriptionHtml?: string | null;
  options?: ShopifyProductOption[];
  images?: ShopifyConnection<ShopifyImage>;
  variants?: ShopifyConnection<ShopifyVariant>;
  featuredImage?: ShopifyImage | null;
  priceRange?: {
    minVariantPrice?: MoneyV2;
    maxVariantPrice?: MoneyV2;
  };
}

export interface ShopifyCollection {
  id?: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  image?: ShopifyImage | null;
  products?: ShopifyConnection<ShopifyProduct>;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise?: {
    id?: string;
    title?: string;
    sku?: string | null;
    image?: ShopifyImage | null;
    product?: { handle?: string; title?: string };
  };
  cost?: {
    totalAmount?: MoneyV2;
  };
}

export interface ShopifyCartCost {
  totalAmount?: MoneyV2;
  subtotalAmount?: MoneyV2;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl?: string;
  lines?: ShopifyConnection<ShopifyCartLine>;
  cost?: ShopifyCartCost;
}

export interface ShopifyUserError {
  field?: string[] | null;
  message: string;
  code?: string;
}

export interface ShopifyPageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface ShopifyEdge<T> {
  node: T;
  cursor?: string;
}

export interface ShopifyConnection<T> {
  pageInfo?: ShopifyPageInfo;
  edges?: ShopifyEdge<T>[] | null;
}

/** Top-level GraphQL error (protocol / field execution). */
export interface ShopifyGraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
}

export interface StorefrontGraphQLResponse<TData> {
  data?: TData;
  errors?: ShopifyGraphQLError[];
}
