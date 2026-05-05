/**
 * Build server-trusted catalog for Stripe Checkout line items.
 * Run via: npm run generate:checkout-catalog (prebuild on production).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { catalogProducts } from '../src/data/products.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'netlify/functions/_data');
const outfile = resolve(outDir, 'checkout-catalog.json');

mkdirSync(outDir, { recursive: true });

type CatalogRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sku: string;
  sizes: string[];
  currency: 'CAD';
  inStock: boolean;
  colorOptions?: string[];
  stitchingOptions?: string[];
};

const slim: CatalogRow[] = catalogProducts.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  sku: p.sku,
  sizes: p.sizes,
  currency: 'CAD',
  inStock: p.inStock,
  colorOptions: p.colorOptions && p.colorOptions.length > 1 ? p.colorOptions : undefined,
  stitchingOptions: p.stitchingOptions && p.stitchingOptions.length > 1 ? p.stitchingOptions : undefined,
}));

writeFileSync(outfile, `${JSON.stringify(slim, null, 2)}\n`, 'utf-8');
process.stdout.write(`Wrote ${slim.length} products to ${outfile}\n`);
