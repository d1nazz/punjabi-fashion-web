/**
 * Compare Shopify collection membership to local catalog slugs (handle === slug).
 * Safe output only — no tokens, no .env dump.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getShopifyCollectionByHandle } from "../src/services/shopify/products.ts";
import {
  getNewArrivals,
  getPartyWearProducts,
  getProductsByCategory,
  getReadyToShip,
  products,
  type Product,
} from "../src/data/products.ts";

const PLACEHOLDER = "PASTE_PUBLIC_STOREFRONT_TOKEN_HERE";
const FIRST = 250;

const COLLECTION_HANDLES = [
  "new-arrivals",
  "ready-to-ship",
  "punjabi-suits",
  "lehengas",
  "party-wear",
  "sharara-gharara",
  "bangles",
  "earrings",
  "necklaces",
  "accessories",
] as const;

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

function getLocalProductsForCollectionHandle(handle: string): Product[] {
  switch (handle) {
    case "new-arrivals":
      return getNewArrivals();
    case "ready-to-ship":
      return getReadyToShip();
    case "punjabi-suits":
      return getProductsByCategory("punjabi-suits");
    case "lehengas":
      return getProductsByCategory("lehengas");
    case "party-wear":
      return getPartyWearProducts();
    case "sharara-gharara":
      return getProductsByCategory("sharara-gharara");
    case "bangles":
      return getProductsByCategory("bangles");
    case "earrings":
      return getProductsByCategory("earrings");
    case "necklaces":
      return getProductsByCategory("necklaces");
    case "accessories":
      return getProductsByCategory("accessories");
    default:
      return [];
  }
}

function printEnvLine(fileEnv: Record<string, string>): void {
  const domain =
    fileEnv.VITE_SHOPIFY_STORE_DOMAIN ??
    process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const version =
    fileEnv.VITE_SHOPIFY_API_VERSION ?? process.env.VITE_SHOPIFY_API_VERSION;
  const token =
    fileEnv.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const t = token?.trim() ?? "";
  const present = Boolean(t && t !== PLACEHOLDER);
  console.log("Env check:");
  console.log(`  Store domain: ${domain?.trim() || "(not set)"}`);
  console.log(`  API version: ${version?.trim() || "(not set)"}`);
  console.log(`  Token present: ${present ? "yes" : "no"}`);
}

type Row = { handle: string; title: string; productType: string };

async function main(): Promise<void> {
  const fileEnv = loadEnvLocal();
  printEnvLine(fileEnv);

  const localBySlug = new Map<string, Product>();
  for (const p of products) {
    const s = p.slug?.trim();
    if (s) localBySlug.set(s, p);
  }
  const allLocalSlugs = new Set(localBySlug.keys());

  const unionShopifyHandles = new Set<string>();

  for (const colHandle of COLLECTION_HANDLES) {
    try {
      const col = await getShopifyCollectionByHandle(colHandle, FIRST);
      if (!col?.products?.edges) {
        console.log(`\n## Collection: ${colHandle}`);
        console.log("  (collection not found or no products connection)");
        continue;
      }

      const firstByHandle = new Map<string, Row>();
      const duplicateHandles: string[] = [];
      let rawEdgeCount = 0;

      for (const e of col.products.edges) {
        rawEdgeCount += 1;
        const n = e?.node;
        if (!n?.handle?.trim()) continue;
        const h = n.handle.trim();
        const row: Row = {
          handle: h,
          title: (n.title ?? "").trim() || "(no title)",
          productType: (n.productType ?? "").trim() || "(none)",
        };
        if (firstByHandle.has(h)) {
          duplicateHandles.push(h);
        } else {
          firstByHandle.set(h, row);
        }
        unionShopifyHandles.add(h);
        unionShopifyHandles.add(h);
      }

      const uniqueRows = [...firstByHandle.values()];
      const shopifyHandleSet = new Set(uniqueRows.map((r) => r.handle));

      const missingNoLocal: Row[] = [];
      let matchedHidden = 0;
      let matchedWithLocal = 0;

      for (const r of uniqueRows) {
        const local = localBySlug.get(r.handle);
        if (!local) {
          missingNoLocal.push(r);
        } else {
          matchedWithLocal += 1;
          if (local.hidden === true) matchedHidden += 1;
        }
      }

      const localCandidates = getLocalProductsForCollectionHandle(colHandle);
      const localNotInShopify = localCandidates
        .map((p) => p.slug.trim())
        .filter((slug) => !shopifyHandleSet.has(slug));

      console.log(`\n## Collection: ${colHandle}`);
      console.log(`  Shopify edges returned: ${rawEdgeCount}`);
      console.log(`  Shopify unique handles: ${uniqueRows.length}`);
      console.log(`  Local slug matches (in full products.ts): ${matchedWithLocal}`);
      console.log(`  Missing local match: ${missingNoLocal.length}`);
      if (matchedHidden > 0) {
        console.log(`  Matched rows where local row has hidden: true: ${matchedHidden}`);
      }
      const uniqDups = [...new Set(duplicateHandles)];
      if (uniqDups.length) {
        console.log(`  Duplicate Shopify handles in API response: ${uniqDups.join(", ")}`);
      }
      if (missingNoLocal.length) {
        console.log("  Missing local (handle | title | productType):");
        for (const m of missingNoLocal) {
          console.log(`    - ${m.handle} | ${m.title} | ${m.productType}`);
        }
      }
      if (localNotInShopify.length) {
        console.log(
          `  Heuristic local-only slugs for this bucket (not in Shopify collection): ${localNotInShopify.length}`,
        );
        for (const s of localNotInShopify.sort()) {
          console.log(`    - ${s}`);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`\n## Collection: ${colHandle}`);
      console.log(`  Error: ${msg}`);
    }
  }

  const shopifyNoLocal = [...unionShopifyHandles].filter(
    (h) => !allLocalSlugs.has(h),
  );
  const localNeverInTheseCollections = [...allLocalSlugs].filter(
    (s) => !unionShopifyHandles.has(s),
  );

  console.log("\n## Summary");
  console.log(
    `  Unique Shopify handles (union across audited collections): ${unionShopifyHandles.size}`,
  );
  console.log(`  Unique local slugs (full products.ts): ${allLocalSlugs.size}`);
  console.log(
    `  Union Shopify handles with no local slug: ${shopifyNoLocal.length}`,
  );
  for (const h of shopifyNoLocal.sort()) {
    console.log(`    - ${h}`);
  }

  console.log(
    `\n  Local slugs never appearing in any audited Shopify collection (count): ${localNeverInTheseCollections.length}`,
  );
  if (
    localNeverInTheseCollections.length > 0 &&
    localNeverInTheseCollections.length <= 40
  ) {
    for (const s of localNeverInTheseCollections.sort()) {
      console.log(`    - ${s}`);
    }
  } else if (localNeverInTheseCollections.length > 40) {
    console.log(
      "    (list omitted; many products are outside these collection rules or men/kids routes)",
    );
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
