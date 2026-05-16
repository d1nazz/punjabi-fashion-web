import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PLACEHOLDER = "PASTE_PUBLIC_STOREFRONT_TOKEN_HERE";
const MAX_RESPONSE_BODY_PRINT = 2000;

const FIXED_DOMAIN_CANDIDATES = [
  "punjabi-fashion.myshopify.com",
  "vsmauk-m2.myshopify.com",
] as const;

const API_VERSION_FALLBACKS = ["2025-10", "2026-01", "2026-04"] as const;

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

function dedupePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function buildDomainCandidates(envDomain: string | undefined): string[] {
  const list: string[] = [];
  if (envDomain?.trim()) list.push(envDomain.trim());
  list.push(...FIXED_DOMAIN_CANDIDATES);
  return dedupePreserveOrder(list);
}

function buildApiVersionCandidates(envVersion: string | undefined): string[] {
  const list: string[] = [];
  if (envVersion?.trim()) list.push(envVersion.trim());
  list.push(...API_VERSION_FALLBACKS);
  return dedupePreserveOrder(list);
}

function storefrontGraphqlUrl(domain: string, apiVersion: string): string {
  return `https://${domain}/api/${apiVersion}/graphql.json`;
}

function printEnvHeader(
  envDomain: string | undefined,
  envVersion: string | undefined,
  token: string | undefined,
): void {
  const d = envDomain?.trim() || "";
  const v = envVersion?.trim() || "";
  const t = token?.trim() ?? "";
  const present = Boolean(t && t !== PLACEHOLDER);
  const length = present ? t.length : 0;
  const adminPrefix = present && t.startsWith("shpat_");
  console.log("Shopify env loaded:");
  console.log(`- Store domain from env: ${d || "(not set)"}`);
  console.log(`- API version from env: ${v || "(not set)"}`);
  console.log(`- Token present: ${present ? "yes" : "no"}`);
  console.log(`- Token length: ${length}`);
  console.log(`- Token starts with shpat_: ${adminPrefix ? "yes" : "no"}`);
}

function printResponseBodySnippet(bodyText: string): void {
  const trimmed = bodyText.trim();
  if (!trimmed) {
    console.log("  Response body: (empty)");
    return;
  }
  const snippet =
    trimmed.length > MAX_RESPONSE_BODY_PRINT
      ? `${trimmed.slice(0, MAX_RESPONSE_BODY_PRINT)}… (truncated)`
      : trimmed;
  console.log("  Response body (non-JSON or raw):");
  console.log(snippet);
}

type GraphqlErr = { message?: string; extensions?: { code?: string } };

function printJsonGraphqlErrors(json: unknown): void {
  const parsed = json as { errors?: GraphqlErr[] };
  if (!parsed.errors?.length) return;
  for (const err of parsed.errors) {
    const msg = err.message?.trim() || "(no message)";
    const code = err.extensions?.code;
    if (code) {
      console.log(`  GraphQL error: ${msg}`);
      console.log(`  extensions.code: ${code}`);
    } else {
      console.log(`  GraphQL error: ${msg}`);
    }
  }
}

function summarizeAttemptJson(
  json: unknown,
  bodyText: string,
): { summary: string; code: string } {
  const parsed = json as { errors?: GraphqlErr[] };
  if (parsed.errors?.length) {
    const first = parsed.errors[0];
    const msg = first.message?.trim() || "(no message)";
    const code = first.extensions?.code?.trim() || "";
    return { summary: msg, code: code || "(none)" };
  }
  if (json === undefined && bodyText.trim()) {
    const t = bodyText.trim();
    const short =
      t.length > 200 ? `${t.slice(0, 200)}…` : t;
    return { summary: `non-JSON: ${short}`, code: "(n/a)" };
  }
  return { summary: "(no GraphQL errors in body)", code: "(n/a)" };
}

const SHOP_QUERY = `
query ShopConnectionTest {
  shop {
    name
    primaryDomain {
      url
      host
    }
  }
}
`;

type AttemptRecord = {
  domain: string;
  version: string;
  url: string;
  httpStatus: string;
  outcome: string;
  errorMessage: string;
  errorCode: string;
};

type FetchOutcome = {
  url: string;
  fetchError?: { name: string; message: string };
  response?: Response;
  bodyText: string;
  json: unknown | undefined;
};

async function postStorefront(
  url: string,
  token: string,
): Promise<FetchOutcome> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token.trim(),
      },
      body: JSON.stringify({ query: SHOP_QUERY }),
    });
    const bodyText = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(bodyText) as unknown;
    } catch {
      json = undefined;
    }
    return { url, response, bodyText, json };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return {
      url,
      bodyText: "",
      json: undefined,
      fetchError: {
        name: err.name || "Error",
        message: err.message || String(e),
      },
    };
  }
}

function extractSuccess(
  httpOk: boolean,
  json: unknown | undefined,
): {
  name: string;
  primaryUrl: string;
  primaryHost: string;
} | null {
  if (!httpOk || json === undefined) return null;
  const parsed = json as {
    errors?: unknown[];
    data?: {
      shop?: {
        name?: string | null;
        primaryDomain?: { url?: string | null; host?: string | null } | null;
      } | null;
    };
  };
  if (parsed.errors?.length) return null;
  const shop = parsed.data?.shop;
  if (!shop?.name) return null;
  const p = shop.primaryDomain;
  const primaryUrl = p?.url?.trim() ?? "(not set)";
  const primaryHost = p?.host?.trim() ?? "(not set)";
  return { name: shop.name, primaryUrl, primaryHost };
}

function printFailureSummary(records: AttemptRecord[]): void {
  console.error("");
  console.error("All Storefront API attempts failed. Summary:");
  for (const r of records) {
    console.error(
      `- ${r.domain} / ${r.version} → HTTP ${r.httpStatus} → ${r.errorMessage} (code: ${r.errorCode})`,
    );
  }
  console.error("");
  console.error("Likely next fixes:");
  console.error("  1. Wrong Storefront token (not the public Storefront API token)");
  console.error("  2. Token not from this store / wrong Headless channel");
  console.error("  3. Storefront API permissions not enabled for the app");
  console.error("  4. Headless storefront not fully configured in Shopify Admin");
  console.error("  5. Shopify domain / token mismatch (try the correct .myshopify.com host)");
  console.error("  6. API endpoint blocked or temporarily unavailable");
  console.error("");
  console.error(
    "Shopify Admin checks: Headless → your custom storefront → Storefront API; copy the public token from that exact storefront; confirm scopes (products, checkout); rotate token if unsure; paste into .env.local and re-run npm run test:shopify.",
  );
  console.error("");
  console.error("Safe curl template (replace placeholders, do not commit secrets):");
  console.error(
    'curl -X POST "https://DOMAIN/api/VERSION/graphql.json" \\',
  );
  console.error('  -H "Content-Type: application/json" \\');
  console.error(
    '  -H "X-Shopify-Storefront-Access-Token: <PUBLIC_STOREFRONT_TOKEN>" \\',
  );
  console.error(`  -d '{"query":"query { shop { name } }"}'`);
}

async function main(): Promise<void> {
  const fileEnv = loadEnvLocal();
  const envDomain =
    fileEnv.VITE_SHOPIFY_STORE_DOMAIN ??
    process.env.VITE_SHOPIFY_STORE_DOMAIN;
  const token =
    fileEnv.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const envVersion =
    fileEnv.VITE_SHOPIFY_API_VERSION ?? process.env.VITE_SHOPIFY_API_VERSION;

  printEnvHeader(envDomain, envVersion, token);

  if (!token?.trim() || token.trim() === PLACEHOLDER) {
    console.error("Missing env variable: VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    process.exitCode = 1;
    return;
  }
  if (!envVersion?.trim()) {
    console.error("Missing env variable: VITE_SHOPIFY_API_VERSION");
    process.exitCode = 1;
    return;
  }

  if (token.trim().startsWith("shpat_")) {
    console.error(
      "Invalid token type: Admin API private token (shpat_) is not valid for Storefront API.",
    );
    process.exitCode = 1;
    return;
  }

  const domains = buildDomainCandidates(envDomain);
  const versions = buildApiVersionCandidates(envVersion);

  if (domains.length === 0) {
    console.error("No store domains to test (set VITE_SHOPIFY_STORE_DOMAIN or use defaults).");
    process.exitCode = 1;
    return;
  }

  const tokenTrimmed = token.trim();
  const records: AttemptRecord[] = [];

  for (const domain of domains) {
    for (const version of versions) {
      const url = storefrontGraphqlUrl(domain, version);
      console.log("");
      console.log("Trying Storefront API:");
      console.log(`- Domain: ${domain}`);
      console.log(`- API version: ${version}`);
      console.log(`- URL: ${url}`);

      const out = await postStorefront(url, tokenTrimmed);

      if (out.fetchError) {
        console.log(`- HTTP status: (no response)`);
        console.log(`  Fetch error name: ${out.fetchError.name}`);
        console.log(`  Message: ${out.fetchError.message}`);
        records.push({
          domain,
          version,
          url,
          httpStatus: "—",
          outcome: "fetch_error",
          errorMessage: out.fetchError.message,
          errorCode: "(n/a)",
        });
        continue;
      }

      const res = out.response!;
      console.log(`- HTTP status: ${res.status}`);

      const shopOk = extractSuccess(res.ok, out.json);
      const hasGraphqlErrors =
        out.json !== undefined &&
        Boolean((out.json as { errors?: unknown[] }).errors?.length);

      if (shopOk && !hasGraphqlErrors) {
        console.log("");
        console.log("Shopify connection OK");
        console.log(`Working domain: ${domain}`);
        console.log(`Working API version: ${version}`);
        console.log(`Shop name: ${shopOk.name}`);
        console.log(`Primary domain url: ${shopOk.primaryUrl}`);
        console.log(`Primary domain host: ${shopOk.primaryHost}`);
        console.log("");
        console.log("Recommended .env.local update (if values differ from current):");
        console.log(`VITE_SHOPIFY_STORE_DOMAIN=${domain}`);
        console.log(`VITE_SHOPIFY_API_VERSION=${version}`);
        process.exitCode = 0;
        return;
      }

      if (out.json !== undefined) {
        printJsonGraphqlErrors(out.json);
      } else if (out.bodyText.trim()) {
        printResponseBodySnippet(out.bodyText);
      }

      const { summary, code } = summarizeAttemptJson(out.json, out.bodyText);
      records.push({
        domain,
        version,
        url,
        httpStatus: String(res.status),
        outcome: res.ok ? "graphql_or_data_error" : "http_error",
        errorMessage: summary,
        errorCode: code,
      });
    }
  }

  printFailureSummary(records);
  process.exitCode = 1;
}

main().catch((e) => {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(`Fetch failed: ${err.name}`);
  console.error(`Message: ${err.message}`);
  process.exitCode = 1;
});
