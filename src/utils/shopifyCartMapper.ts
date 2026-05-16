import { getProductBySlug, isCatalogProduct } from '@/data/products';
import type { CartLineItem } from '@/types/commerce';
import type { ShopifyCart } from '@/types/shopify';

function asCadCurrency(code: string | undefined): CartLineItem['currency'] {
  return (String(code ?? 'CAD').toUpperCase() === 'CAD' ? 'CAD' : 'CAD') as CartLineItem['currency'];
}

/**
 * Map a Storefront cart into display rows. Prices are per-unit derived from line totals for display only.
 */
export function mapShopifyCartToCartLines(cart: ShopifyCart): CartLineItem[] {
  const edges = cart.lines?.edges ?? [];
  const rows: CartLineItem[] = [];

  for (const edge of edges) {
    const node = edge.node;
    const m = node.merchandise;
    const handle = m?.product?.handle?.trim() ?? '';
    if (!m?.id || !handle) continue;

    const local = getProductBySlug(handle);
    if (!local || !isCatalogProduct(local)) continue;

    const qty = typeof node.quantity === 'number' && node.quantity > 0 ? node.quantity : 1;
    const total = Number.parseFloat(node.cost?.totalAmount?.amount ?? '0');
    const unit = Number.isFinite(total) && qty > 0 ? total / qty : 0;
    const image = m.image?.url?.trim() || local.images[0];
    const rawVariantTitle = (m.title ?? '').trim();
    const sizeDisplay =
      rawVariantTitle === 'Default Title' || rawVariantTitle === ''
        ? (local.sizes[0] ?? 'One Size')
        : rawVariantTitle;

    rows.push({
      lineId: node.id,
      productId: local.id,
      slug: handle,
      name: m.product?.title ?? local.name,
      price: unit,
      currency: asCadCurrency(node.cost?.totalAmount?.currencyCode),
      sku: String(m.sku ?? local.sku ?? '').trim() || local.sku,
      image,
      quantity: node.quantity,
      selectedOptions: {
        size: sizeDisplay,
        color: undefined,
        stitchingType: undefined,
      },
    });
  }

  return rows;
}
