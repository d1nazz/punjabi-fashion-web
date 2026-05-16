import type { Product } from '@/data/products';
import type { SelectedProductOptions } from '@/types/commerce';

/** Multiple sizes means customer must choose (unless only one option). */
export function productRequiresExplicitSize(product: Product): boolean {
  return Array.isArray(product.sizes) && product.sizes.length > 1;
}

export function productRequiresColorChoice(product: Product): boolean {
  return Array.isArray(product.colorOptions) && product.colorOptions.length > 1;
}

export function productRequiresStitchingChoice(product: Product): boolean {
  return Array.isArray(product.stitchingOptions) && product.stitchingOptions.length > 1;
}

export function productHasAnyRequiredOptions(product: Product): boolean {
  return (
    productRequiresExplicitSize(product) ||
    productRequiresColorChoice(product) ||
    productRequiresStitchingChoice(product)
  );
}

export function productAllowsQuickAdd(product: Product): boolean {
  return !productHasAnyRequiredOptions(product);
}

/** Jewelry / accessories / single-option products map to Shopify’s default (first sellable) variant. */
export function productUsesDefaultShopifyVariant(product: Product): boolean {
  const jewelry =
    ['Bangles', 'Earrings', 'Necklaces'].includes(product.subcategory ?? '') ||
    ['bangles', 'necklaces', 'earrings'].includes(product.category);
  if (jewelry) return true;
  return !productHasAnyRequiredOptions(product);
}

export function normalizeDefaultSelectedSize(product: Product): string | undefined {
  if (!product.sizes?.length) return undefined;
  if (product.sizes.length === 1) return product.sizes[0];
  return undefined;
}

export function validateSelectedOptionsForCart(product: Product, opts: SelectedProductOptions): string | null {
  const size = String(opts.size ?? '').trim();
  if (!size || !product.sizes?.includes(size)) {
    return productRequiresExplicitSize(product)
      ? 'Please select a size before adding to cart.'
      : 'This product is missing a valid size. Please view the product page.';
  }
  if (productRequiresColorChoice(product)) {
    const c = String(opts.color ?? '').trim();
    if (!c || !product.colorOptions?.includes(c)) {
      return 'Please select a colour before adding to cart.';
    }
  }
  if (productRequiresStitchingChoice(product)) {
    const s = String(opts.stitchingType ?? '').trim();
    if (!s || !product.stitchingOptions?.includes(s)) {
      return 'Please select a stitching option before adding to cart.';
    }
  }
  if (!product.inStock) return 'This piece is currently unavailable.';
  return null;
}
