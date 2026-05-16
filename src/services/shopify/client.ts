import type { StorefrontGraphQLResponse } from "@/types/shopify";

const DEFAULT_API_VERSION = "2025-01";

function normalizeStoreDomain(domain: string): string {
  let d = domain.trim();
  if (d.startsWith("https://")) d = d.slice("https://".length);
  if (d.startsWith("http://")) d = d.slice("http://".length);
  const slash = d.indexOf("/");
  if (slash !== -1) d = d.slice(0, slash);
  return d;
}

export function getShopifyStorefrontEndpoint(): string {
  const domainRaw = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
  const versionRaw =
    import.meta.env.VITE_SHOPIFY_API_VERSION || DEFAULT_API_VERSION;

  if (domainRaw == null || String(domainRaw).trim() === "") {
    throw new Error(
      "Shopify Storefront API: VITE_SHOPIFY_STORE_DOMAIN is not set.",
    );
  }

  const domain = normalizeStoreDomain(String(domainRaw));
  const version = String(versionRaw).trim() || DEFAULT_API_VERSION;
  return `https://${domain}/api/${version}/graphql.json`;
}

export function getShopifyStorefrontAccessToken(): string {
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (token == null || String(token).trim() === "") {
    throw new Error(
      "Shopify Storefront API: VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set.",
    );
  }
  return String(token).trim();
}

/**
 * POST to the Storefront API. Never logs tokens or full auth headers.
 */
export async function shopifyStorefrontRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const url = getShopifyStorefrontEndpoint();
  const token = getShopifyStorefrontAccessToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables: variables ?? {} }),
  });

  const text = await res.text();
  let body: StorefrontGraphQLResponse<TData>;
  try {
    body = JSON.parse(text) as StorefrontGraphQLResponse<TData>;
  } catch {
    throw new Error(
      `Shopify Storefront API: response was not JSON (HTTP ${res.status}).`,
    );
  }

  if (!res.ok) {
    throw new Error(
      `Shopify Storefront API: HTTP ${res.status}. Check store domain and API version.`,
    );
  }

  if (body.errors?.length) {
    const msg = body.errors.map((e) => e.message).join("; ");
    throw new Error(`Shopify Storefront API: ${msg}`);
  }

  if (body.data == null) {
    throw new Error("Shopify Storefront API: empty data in response.");
  }

  return body.data;
}
