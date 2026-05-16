import type { Product } from "@/data/products";
import { getShopifyProductByHandle } from "@/services/shopify/products";
import type { ShopifyVariant } from "@/types/shopify";
import type { SelectedProductOptions } from "@/types/commerce";
import {
  productRequiresColorChoice,
  productRequiresExplicitSize,
  productRequiresStitchingChoice,
  productUsesDefaultShopifyVariant,
} from "@/utils/productPurchase";

export class ShopifyVariantResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopifyVariantResolutionError";
  }
}

export interface ResolvedShopifyVariant {
  handle: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string | null;
  price: number;
  currencyCode: string;
  availableForSale: boolean;
}

function parseMoney(v: ShopifyVariant): { price: number; currencyCode: string } {
  const amount = Number.parseFloat(v.price?.amount ?? "0");
  const currencyCode = (v.price?.currencyCode ?? "CAD").trim() || "CAD";
  return { price: Number.isFinite(amount) ? amount : 0, currencyCode };
}

function variantMatchesOptions(
  v: ShopifyVariant,
  localProduct: Product,
  opts: SelectedProductOptions,
): boolean {
  const so = v.selectedOptions ?? [];

  if (productRequiresExplicitSize(localProduct)) {
    const wantSize = opts.size.trim();
    const sizeOpt = so.find((o) => /^size$/i.test(o.name));
    if (sizeOpt) {
      if (sizeOpt.value.trim() !== wantSize) return false;
    } else if (v.title && v.title !== "Default Title") {
      if (v.title.trim() !== wantSize) return false;
    } else {
      return false;
    }
  }

  if (productRequiresColorChoice(localProduct) && opts.color?.trim()) {
    const want = opts.color.trim();
    const colorOpt = so.find((o) => /^colou?r$/i.test(o.name));
    if (colorOpt && colorOpt.value.trim() !== want) return false;
  }

  if (productRequiresStitchingChoice(localProduct) && opts.stitchingType?.trim()) {
    const want = opts.stitchingType.trim();
    const stitchOpt = so.find((o) => /stitch/i.test(o.name));
    if (stitchOpt && stitchOpt.value.trim() !== want) return false;
  }

  return true;
}

function pickDefaultVariant(variants: ShopifyVariant[]): ShopifyVariant | null {
  const available = variants.filter((v) => v.availableForSale);
  if (available.length) return available[0] ?? null;
  return variants[0] ?? null;
}

function toResolved(
  handle: string,
  productTitle: string,
  v: ShopifyVariant,
): ResolvedShopifyVariant {
  const { price, currencyCode } = parseMoney(v);
  return {
    handle,
    productTitle,
    variantId: v.id,
    variantTitle: String(v.title ?? ""),
    sku: v.sku ?? null,
    price,
    currencyCode,
    availableForSale: Boolean(v.availableForSale),
  };
}

/**
 * Resolve local slug + selected options to a Storefront variant GID for cart lines.
 * Never logs secrets.
 */
export async function resolveShopifyVariantForCart(
  localProduct: Product,
  opts: SelectedProductOptions,
): Promise<ResolvedShopifyVariant> {
  const handle = localProduct.slug.trim();
  if (!handle) {
    throw new ShopifyVariantResolutionError(
      "This product is not available online right now.",
    );
  }

  const shopifyProduct = await getShopifyProductByHandle(handle);
  if (!shopifyProduct) {
    throw new ShopifyVariantResolutionError(
      "This product is not available online right now.",
    );
  }

  const productTitle = shopifyProduct.title ?? localProduct.name;
  const variants = (shopifyProduct.variants?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is ShopifyVariant => Boolean(n?.id));

  if (!variants.length) {
    throw new ShopifyVariantResolutionError(
      "This product is not available online right now.",
    );
  }

  if (productUsesDefaultShopifyVariant(localProduct)) {
    const picked = pickDefaultVariant(variants);
    if (!picked) {
      throw new ShopifyVariantResolutionError(
        "This product is not available online right now.",
      );
    }
    if (!picked.availableForSale) {
      throw new ShopifyVariantResolutionError(
        "This item is currently unavailable.",
      );
    }
    return toResolved(handle, productTitle, picked);
  }

  const candidates = variants.filter((v) =>
    variantMatchesOptions(v, localProduct, opts),
  );

  if (!candidates.length) {
    throw new ShopifyVariantResolutionError(
      "The selected size or options are not available. Please choose another combination.",
    );
  }

  const availablePick = candidates.find((v) => v.availableForSale);
  if (!availablePick) {
    throw new ShopifyVariantResolutionError(
      "This combination is currently unavailable.",
    );
  }

  return toResolved(handle, productTitle, availablePick);
}
