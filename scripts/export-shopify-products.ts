/**
 * Export local catalog to Shopify Admin product import CSV + audit JSON.
 * Run: npm run export:shopify-products
 *
 * products.csv intentionally omits all image columns so Shopify CSV import
 * does not fail on empty Image Src.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  isBangleProduct,
  products,
  type Product,
} from "../src/data/products.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "shopify-export");

const VENDOR = "Punjabi Fashion";
const GRAMS_CLOTHING = 500;
const GRAMS_ACCESSORY = 200;
const DEFAULT_INV_QTY = 1;

/** Columns for Shopify Admin import — no image fields. */
const SHOPIFY_IMPORT_COLUMNS = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "SEO Title",
  "SEO Description",
  "Status",
] as const;

const REVIEW_IMAGE_COLUMNS = [
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Variant Image",
] as const;

const REVIEW_COLUMNS = [
  ...SHOPIFY_IMPORT_COLUMNS,
  ...REVIEW_IMAGE_COLUMNS,
] as const;

type ShopifyRow = Record<(typeof SHOPIFY_IMPORT_COLUMNS)[number], string>;
type ReviewRow = Record<(typeof REVIEW_COLUMNS)[number], string>;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeCsv(val: string): string {
  if (val.includes('"')) val = val.replace(/"/g, '""');
  if (/[",\n\r]/.test(val)) return `"${val}"`;
  return val;
}

function rowToLine(columns: readonly string[], row: Record<string, string>): string {
  return columns.map((c) => escapeCsv(row[c] ?? "")).join(",");
}

function isJewelryLike(p: Product): boolean {
  if (isBangleProduct(p)) return true;
  const cat = p.category.toLowerCase();
  if (["bangles", "earrings", "necklaces", "jewelry"].includes(cat)) return true;
  if (cat === "accessories") {
    const sub = (p.subcategory ?? "").toLowerCase();
    return ["earrings", "necklaces", "bangles", "jewelry"].includes(sub);
  }
  return false;
}

function useTitleDefaultOption(p: Product): boolean {
  if (isJewelryLike(p)) return true;
  if (!p.sizes?.length) return true;
  if (
    p.sizes.length === 1 &&
    p.sizes[0].trim().toLowerCase() === "one size"
  ) {
    return true;
  }
  return false;
}

function variantGrams(p: Product): string {
  return String(isJewelryLike(p) ? GRAMS_ACCESSORY : GRAMS_CLOTHING);
}

function buildBodyHtml(p: Product): string {
  const parts: string[] = [`<p>${escapeHtml(p.description)}</p>`];
  if (p.fabric)
    parts.push(`<p><strong>Fabric:</strong> ${escapeHtml(p.fabric)}</p>`);
  if (p.embellishment)
    parts.push(
      `<p><strong>Embellishment:</strong> ${escapeHtml(p.embellishment)}</p>`,
    );
  if (p.lining)
    parts.push(`<p><strong>Lining:</strong> ${escapeHtml(p.lining)}</p>`);
  if (p.care)
    parts.push(`<p><strong>Care:</strong> ${escapeHtml(p.care)}</p>`);
  if (p.fitNotes)
    parts.push(`<p><strong>Fit notes:</strong> ${escapeHtml(p.fitNotes)}</p>`);
  if (p.shippingNote)
    parts.push(
      `<p><strong>Shipping:</strong> ${escapeHtml(p.shippingNote)}</p>`,
    );
  return parts.join("\n");
}

function seoDescription(p: Product): string {
  const t = p.description.replace(/\s+/g, " ").trim();
  return t.length > 160 ? `${t.slice(0, 157)}...` : t;
}

function addTag(set: Set<string>, raw: string): void {
  const x = raw.trim();
  if (!x) return;
  const key = x.toLowerCase();
  for (const ex of set) {
    if (ex.toLowerCase() === key) return;
  }
  set.add(x);
}

function buildTags(p: Product): string {
  const set = new Set<string>();
  addTag(set, p.category.replace(/-/g, " "));
  if (p.subcategory) addTag(set, p.subcategory);
  if (p.collection) addTag(set, p.collection);
  for (const o of p.occasion) addTag(set, o);
  for (const t of p.tags) addTag(set, t);
  addTag(set, p.colorFamily);
  if (p.color) addTag(set, p.color);
  if (p.isReadyToShip) addTag(set, "ready-to-ship");
  if (p.isNew) addTag(set, "new-arrival");
  if (p.isSale) addTag(set, "sale");
  if (p.isBridal) addTag(set, "bridal");
  if (p.isBestSeller) addTag(set, "best-seller");
  return [...set].join(", ");
}

function colorVariantDimensions(p: Product): {
  name: string;
  values: string[];
} | null {
  const opts = p.colorOptions?.filter((c) => c.trim()) ?? [];
  if (opts.length > 1) return { name: "Color", values: opts };
  return null;
}

function emptyShopifyRow(): ShopifyRow {
  const r = {} as ShopifyRow;
  for (const c of SHOPIFY_IMPORT_COLUMNS) r[c] = "";
  return r;
}

function baseProductRow(p: Product, handle: string): ShopifyRow {
  const hidden = p.hidden === true;
  const row = emptyShopifyRow();
  row.Handle = handle;
  row.Title = p.name;
  row["Body (HTML)"] = buildBodyHtml(p);
  row.Vendor = VENDOR;
  row["Product Category"] = "";
  row.Type = p.subcategory ?? p.category.replace(/-/g, " ");
  row.Tags = buildTags(p);
  row.Published = hidden ? "FALSE" : "TRUE";
  row["SEO Title"] = p.name;
  row["SEO Description"] = seoDescription(p);
  row.Status = hidden ? "draft" : "active";
  row["Variant Inventory Tracker"] = "shopify";
  row["Variant Inventory Qty"] = String(DEFAULT_INV_QTY);
  row["Variant Inventory Policy"] = "deny";
  row["Variant Fulfillment Service"] = "manual";
  row["Variant Requires Shipping"] = "TRUE";
  row["Variant Taxable"] = p.taxable !== false ? "TRUE" : "FALSE";
  row["Variant Price"] = String(p.price);
  row["Variant Compare At Price"] =
    p.compareAtPrice != null ? String(p.compareAtPrice) : "";
  return row;
}

function variantSkuForExport(p: Product, suffix: string): string {
  if (useTitleDefaultOption(p)) return p.sku.trim();
  const safe = suffix.replace(/\s+/g, "-");
  return `${p.sku.trim()}-${safe}`;
}

function imagePublicUrl(src: string): boolean {
  return (
    src.startsWith("http://") || src.startsWith("https://")
  );
}

function buildShopifyRows(p: Product): ShopifyRow[] {
  const handle = (p.slug ?? "").trim();

  const colorDim = colorVariantDimensions(p);
  const useTitle = useTitleDefaultOption(p);
  const sizes = useTitle
    ? ["Default Title"]
    : [...p.sizes].filter((x) => x.trim());

  if (!useTitle && sizes.length === 0) {
    sizes.push("Default Title");
  }

  const colorVals = colorDim ? colorDim.values : [""];
  const rows: ShopifyRow[] = [];
  let isFirst = true;

  for (const sizeVal of sizes) {
    for (const colorVal of colorVals) {
      const row = isFirst ? baseProductRow(p, handle) : emptyShopifyRow();
      if (!isFirst) {
        row.Handle = handle;
        row["Variant Inventory Tracker"] = "shopify";
        row["Variant Inventory Qty"] = String(DEFAULT_INV_QTY);
        row["Variant Inventory Policy"] = "deny";
        row["Variant Fulfillment Service"] = "manual";
        row["Variant Requires Shipping"] = "TRUE";
        row["Variant Taxable"] = p.taxable !== false ? "TRUE" : "FALSE";
        row["Variant Price"] = String(p.price);
        row["Variant Compare At Price"] =
          p.compareAtPrice != null ? String(p.compareAtPrice) : "";
      }

      if (useTitle) {
        row["Option1 Name"] = "Title";
        row["Option1 Value"] = "Default Title";
      } else {
        row["Option1 Name"] = "Size";
        row["Option1 Value"] = sizeVal;
      }

      if (colorDim) {
        row["Option2 Name"] = colorDim.name;
        row["Option2 Value"] = colorVal;
      }

      const skuSuffix =
        useTitle ? "" : colorDim ? `${sizeVal}-${colorVal}` : sizeVal;
      row["Variant SKU"] = variantSkuForExport(p, skuSuffix);
      row["Variant Grams"] = variantGrams(p);

      rows.push(row);
      isFirst = false;
    }
  }

  return rows;
}

function toReviewRow(
  row: ShopifyRow,
  p: Product,
  isFirstRowOfProduct: boolean,
): ReviewRow {
  const r = { ...row } as ReviewRow;
  for (const c of REVIEW_IMAGE_COLUMNS) r[c] = "";
  if (isFirstRowOfProduct && p.images[0]) {
    const local = String(p.images[0]);
    r["Image Src"] = local;
    r["Image Position"] = "1";
    r["Image Alt Text"] = `${p.name} - 1`;
    r["Variant Image"] = local;
  }
  return r;
}

type AuditProduct = {
  id: string;
  name: string;
  slug: string;
  handle: string;
  hidden: boolean;
  category: string;
  variantRows: number;
  localImagePaths: string[];
  hasLocalImages: boolean;
  warnings: string[];
};

function auditProduct(p: Product, csvRows: ShopifyRow[]): AuditProduct {
  const warnings: string[] = [];
  if (!p.slug?.trim()) warnings.push("Missing slug — assign handle before import");
  if (p.price == null || Number.isNaN(Number(p.price)))
    warnings.push("Missing or invalid price");
  if (!p.images?.length) warnings.push("No images in catalog");
  if (!p.sku?.trim()) warnings.push("Missing SKU");
  if (p.hidden) warnings.push("Exported as Status draft / Published FALSE");

  const localPaths = p.images.map((x) => String(x));
  const allLocalNonPublic = localPaths.length > 0 && localPaths.every((s) => !imagePublicUrl(s));
  if (allLocalNonPublic) {
    warnings.push(
      "Image columns excluded from products.csv — paths are bundled/local, not public https URLs. Upload images in Shopify Admin or run a media migration.",
    );
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    handle: p.slug?.trim() ?? "",
    hidden: p.hidden === true,
    category: p.category,
    variantRows: csvRows.length,
    localImagePaths: localPaths,
    hasLocalImages: localPaths.length > 0,
    warnings: [...new Set(warnings)],
  };
}

function main(): void {
  mkdirSync(outDir, { recursive: true });

  const slugCounts = new Map<string, number>();
  for (const p of products) {
    const s = (p.slug ?? "").trim();
    if (s) slugCounts.set(s, (slugCounts.get(s) ?? 0) + 1);
  }

  const allShopifyRows: ShopifyRow[] = [];
  const allReviewRows: ReviewRow[] = [];
  const auditProducts: AuditProduct[] = [];

  for (const p of products) {
    const rows = buildShopifyRows(p);
    let first = true;
    for (const row of rows) {
      allReviewRows.push(toReviewRow(row, p, first));
      first = false;
    }
    const au = auditProduct(p, rows);
    const s = (p.slug ?? "").trim();
    if (s && (slugCounts.get(s) ?? 0) > 1) {
      au.warnings.push("Duplicate slug/handle in local catalog");
    }
    auditProducts.push(au);
    allShopifyRows.push(...rows);
  }

  const total = products.length;
  const totalVariants = allShopifyRows.length;
  const visible = products.filter((p) => p.hidden !== true).length;
  const hidden = products.filter((p) => p.hidden === true).length;
  const productsWithLocalImages = products.filter((p) => p.images?.length > 0)
    .length;
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const missingPrice = products.filter(
    (p) => p.price == null || Number.isNaN(Number(p.price)),
  ).length;
  const missingImages = products.filter((p) => !p.images?.length).length;
  const missingSku = products.filter((p) => !p.sku?.trim()).length;
  const missingSlug = products.filter((p) => !p.slug?.trim()).length;

  const importNote =
    "products.csv excludes Image Src, Image Position, Image Alt Text, and Variant Image because Shopify CSV import requires public absolute image URLs. Local Vite asset paths would trigger 'Missing image source data'. Add images in Admin after import or use a separate media step.";

  const csvPath = resolve(outDir, "products.csv");
  const shopifyLines = [
    SHOPIFY_IMPORT_COLUMNS.join(","),
    ...allShopifyRows.map((r) => rowToLine(SHOPIFY_IMPORT_COLUMNS as unknown as string[], r)),
  ];
  writeFileSync(csvPath, `${shopifyLines.join("\n")}\n`, "utf-8");

  const reviewPath = resolve(outDir, "products-with-local-image-references.csv");
  const reviewLines = [
    REVIEW_COLUMNS.join(","),
    ...allReviewRows.map((r) => rowToLine(REVIEW_COLUMNS as unknown as string[], r)),
  ];
  writeFileSync(reviewPath, `${reviewLines.join("\n")}\n`, "utf-8");

  const auditPath = resolve(outDir, "products.audit.json");
  writeFileSync(
    auditPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "src/data/products.ts",
        summary: {
          totalProducts: total,
          totalVariantsExported: totalVariants,
          visibleProducts: visible,
          hiddenProducts: hidden,
          productsWithLocalImages,
          importCsvImageExclusionNote: importNote,
          categoriesCount: categories.length,
          categories,
          productsMissingPrice: missingPrice,
          productsMissingImages: missingImages,
          productsMissingSku: missingSku,
          productsMissingSlug: missingSlug,
        },
        products: auditProducts,
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );

  const readmePath = resolve(outDir, "README.md");
  writeFileSync(
    readmePath,
    `# Shopify product import (Punjabi Fashion)

This folder is generated by \`npm run export:shopify-products\`.

## Which file to use

| File | Purpose |
|------|---------|
| **products.csv** | **Use this for Shopify Admin import.** No image columns — avoids Shopify’s *Missing image source data* error. |
| **products-with-local-image-references.csv** | **Do not import into Shopify.** Internal review only: includes local Vite paths, not public \`https://\` URLs. |
| **products.audit.json** | Full audit, local image paths per product, and data warnings. |

### Why images are not in products.csv

Bundled assets resolve to paths like \`/src/assets/...\`, not public URLs. Shopify’s product CSV importer expects **Image Src** (and related columns) to be valid absolute URLs if those columns exist. This export **omits image columns entirely** from **products.csv** so products, variants, SKUs, prices, and copy import cleanly. **Upload images later** in Admin or via a dedicated media migration.

---

## Shopify import steps (products.csv only)

1. Shopify Admin → **Products** → **Import**.
2. Choose **Upload a Shopify-formatted CSV file** (wording may vary slightly by Admin version).
3. Upload **\`shopify-export/products.csv\`** from this repo.
4. Leave **Publish new products to all sales channels** checked (unless you intentionally want drafts only).
5. Click **Upload and preview**.
6. Review validation and fix any errors shown.
7. **Import products**.
8. **Images:** add later per product (or bulk) — use **products.audit.json** or **products-with-local-image-references.csv** only as a reference for filenames/paths.

---

## Troubleshooting

- **“Missing image source data”** — You imported the wrong file (e.g. **products-with-local-image-references.csv**) or a CSV that still includes empty image columns. Re-run \`npm run export:shopify-products\` and import **products.csv** only.

---

## Pricing

Store currency should be **CAD**. The CSV uses numeric prices only (no currency symbol).

## Variants

- Apparel: **Size** options, one row per size. **Variant SKU** is \`{baseSku}-{Size}\` for uniqueness.
- Jewelry / one-size accessories: **Title** / **Default Title**, base **SKU** unchanged.

Regenerate after editing \`src/data/products.ts\`.
`,
    "utf-8",
  );

  process.stdout.write(
    `Wrote ${total} products (${totalVariants} variant rows) → ${csvPath}\n` +
      `Review CSV (do not import): ${reviewPath}\n`,
  );
}

main();
