/**
 * Verify Shopify collections exist via Storefront API (by handle).
 * Safe output only — never prints token or headers.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PLACEHOLDER = "PASTE_PUBLIC_STOREFRONT_TOKEN_HERE";

const EXPECTED_HANDLES = [
  "punjabi-suits",
  "best-sellers",
  "ready-to-ship",
  "new-arrivals",
  "accessories",
  "necklaces",
  "earrings",
  "bangles",
  "sharara-gharara",
  "party-wear",
  "lehengas",
] as const;

const COLLECTION_QUERY = `
query CollectionByHandle($handle: String!) {
  collection(handle: $handle) {
    id
    handle
    title
    products(first: 5) {
      edges {
        node {
          id
          handle
          title
          productType
          tags
          variants(first: 3) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

function loadEnvLocal(): Record<string, string> {
  const filePath = resolve(process.cwd(), ".env.local");
  const result: Record<string, string> = {};
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    return result;
  }
  for (const line of raw.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function printEnvSummary(
  domain: string | undefined,
  version: string | undefined,
  tokenPresent: boolean,
  tokenLen: number,
  shpat: boolean,
): void {
  console.log("Shopify env (from .env.local / process.env):");
  console.log(`- Store domain: ${domain?.trim() || "(not set)"}`);
  console.log(`- API version: ${version?.trim() || "(not set)"}`);
  console.log(`- Token present: ${tokenPresent ? "yes" : "no"}`);
  console.log(`- Token length: ${tokenLen}`);
  console.log(`- Token starts with shpat_: ${shpat ? "yes" : "no"}`);
}

type VariantNode = {
  title?: string | null;
  sku?: string | null;
  availableForSale?: boolean;
  price?: { amount?: string; currencyCode?: string } | null;
};

type ProductNode = {
  handle?: string | null;
  title?: string | null;
  productType?: string | null;
  tags?: string[];
  variants?: {
    edges?: Array<{ node?: VariantNode | null } | null>;
  } | null;
};

type GraphqlResponse = {
  errors?: Array<{ message?: string }>;
  data?: {
    collection?: {
      id?: string;
      handle?: string;
      title?: string;
      products?: {
        edges?: Array<{ node?: ProductNode | null } | null>;
      } | null;
    } | null;
  } | null;
};

async function main(): Promise<void> {
  const fileEnv = loadEnvLocal();
  const domain =
    fileEnv.VITE_SHOPIFY_STORE_DOMAIN ?? process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const token =
    fileEnv.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const version =
    fileEnv.VITE_SHOPIFY_API_VERSION ?? process.env.VITE_SHOPIFY_API_VERSION;

  const tokenTrimmed = token?.trim() ?? "";
  const present = Boolean(tokenTrimmed && tokenTrimmed !== PLACEHOLDER);
  printEnvSummary(
    domain,
    version,
    present,
    present ? tokenTrimmed.length : 0,
    present && tokenTrimmed.startsWith("shpat_"),
  );

  if (!domain?.trim()) {
    console.error("Missing: VITE_SHOPIFY_STORE_DOMAIN");
    process.exitCode = 1;
    return;
  }
  if (!present) {
    console.error("Missing: VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    process.exitCode = 1;
    return;
  }
  if (!version?.trim()) {
    console.error("Missing: VITE_SHOPIFY_API_VERSION");
    process.exitCode = 1;
    return;
  }
  if (tokenTrimmed.startsWith("shpat_")) {
    console.error("Invalid token: Storefront API requires public token, not shpat_");
    process.exitCode = 1;
    return;
  }

  const url = `https://${domain.trim()}/api/${version.trim()}/graphql.json`;
  console.log("");
  console.log(`Storefront endpoint: ${url}`);

  const missingHandles: string[] = [];
  let apiOk = true;

  for (const handle of EXPECTED_HANDLES) {
    console.log("");
    console.log(`Handle: ${handle}`);

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": tokenTrimmed,
        },
        body: JSON.stringify({
          query: COLLECTION_QUERY,
          variables: { handle },
        }),
      });
    } catch (e) {
      apiOk = false;
      const err = e instanceof Error ? e : new Error(String(e));
      console.log(`Found: no`);
      console.log(`Collection not found for handle: ${handle}`);
      console.log(`  (network error: ${err.name} — ${err.message})`);
      missingHandles.push(handle);
      continue;
    }

    let body: GraphqlResponse;
    try {
      body = (await res.json()) as GraphqlResponse;
    } catch {
      apiOk = false;
      console.log(`Found: no`);
      console.log(`Collection not found for handle: ${handle}`);
      console.log("  (invalid JSON response)");
      missingHandles.push(handle);
      continue;
    }

    if (!res.ok) {
      apiOk = false;
      console.log(`Found: no`);
      console.log(`Collection not found for handle: ${handle}`);
      console.log(`  (HTTP ${res.status})`);
      missingHandles.push(handle);
      continue;
    }

    if (body.errors?.length) {
      apiOk = false;
      const msg = body.errors.map((x) => x.message).filter(Boolean).join("; ");
      console.log(`Found: no`);
      console.log(`Collection not found for handle: ${handle}`);
      if (msg) console.log(`  (GraphQL: ${msg})`);
      missingHandles.push(handle);
      continue;
    }

    const col = body.data?.collection;
    if (!col) {
      console.log("Found: no");
      console.log(`Collection not found for handle: ${handle}`);
      missingHandles.push(handle);
      continue;
    }

    const edges = col.products?.edges ?? [];
    const sampleCount = edges.length;
    console.log("Found: yes");
    console.log(`Title: ${col.title ?? "(no title)"}`);
    console.log(`Product sample count returned: ${sampleCount}`);

    const first = edges[0]?.node;
    if (!first) {
      console.log("First product: (none in sample)");
      continue;
    }

    const v0 = first.variants?.edges?.[0]?.node;
    const priceStr =
      v0?.price?.amount != null && v0?.price?.currencyCode
        ? `${v0.price.amount} ${v0.price.currencyCode}`
        : "(no price on first variant)";

    console.log("First product:");
    console.log(`- title: ${first.title ?? ""}`);
    console.log(`- handle: ${first.handle ?? ""}`);
    console.log(`- productType: ${first.productType ?? ""}`);
    console.log(`- first variant title: ${v0?.title ?? "(none)"}`);
    console.log(`- first variant sku: ${v0?.sku ?? "(none)"}`);
    console.log(`- price amount/currency: ${priceStr}`);
    console.log(
      `- availableForSale: ${v0?.availableForSale === true ? "true" : v0?.availableForSale === false ? "false" : "unknown"}`,
    );
  }

  console.log("");
  console.log("---");
  console.log(
    `Summary: ${EXPECTED_HANDLES.length - missingHandles.length}/${EXPECTED_HANDLES.length} handles found.`,
  );
  if (missingHandles.length) {
    console.log("Missing or errored handles:", missingHandles.join(", "));
  }
  if (!apiOk || missingHandles.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(`${err.name}: ${err.message}`);
  process.exitCode = 1;
});
