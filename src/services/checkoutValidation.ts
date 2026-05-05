import { getProductById, isCatalogProduct } from '@/data/products';
import type { CartLineItem } from '@/types/commerce';
import { validateSelectedOptionsForCart } from '@/utils/productPurchase';

export function validateCartForCheckout(lines: CartLineItem[]): string | null {
  if (!lines.length) return 'Your cart is empty.';

  for (const line of lines) {
    const product = getProductById(line.productId);

    if (!product || !isCatalogProduct(product)) {
      return 'Something in your cart is no longer available. Please refresh and try again.';
    }

    if (product.price !== line.price || (product.currency ?? 'CAD') !== line.currency) {
      return 'Your cart may be out of date. Please refresh the page and try checkout again.';
    }

    const optionError = validateSelectedOptionsForCart(product, line.selectedOptions);
    if (optionError) return optionError;
  }

  return null;
}
