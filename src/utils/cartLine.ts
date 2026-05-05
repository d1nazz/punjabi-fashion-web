import type { SelectedProductOptions } from '@/types/commerce';
import type { Product } from '@/data/products';

/** Deterministic merge key — must match Netlify validator logic */

export function buildCartLineId(productId: string, opts: SelectedProductOptions): string {
  const norm = (s: string) => String(s ?? '').trim();
  const size = norm(opts.size);
  const color = norm(opts.color ?? '');
  const stitch = norm(opts.stitchingType ?? '');
  return `${productId}::sz:${size}::clr:${color}::st:${stitch}`;
}

export function optionsSummary(opts: SelectedProductOptions): string {
  const bits: string[] = [];
  bits.push(opts.size ? `Size: ${opts.size}` : '');
  bits.push(opts.color ? `Colour: ${opts.color}` : '');
  bits.push(opts.stitchingType ? `Stitching: ${opts.stitchingType}` : '');
  return bits.filter(Boolean).join(' · ');
}

export function buildCartLineItem(product: Product, quantity: number, opts: SelectedProductOptions) {
  return {
    lineId: buildCartLineId(product.id, opts),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    currency: (product.currency ?? 'CAD') as const,
    sku: product.sku,
    image: product.images[0],
    quantity,
    selectedOptions: {
      size: opts.size.trim(),
      color: opts.color?.trim() || undefined,
      stitchingType: opts.stitchingType?.trim() || undefined,
    },
  };
}
