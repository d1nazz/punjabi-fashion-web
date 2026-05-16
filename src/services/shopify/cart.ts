import { shopifyStorefrontRequest } from "@/services/shopify/client";
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/services/shopify/queries";
import type { ShopifyCart, ShopifyUserError } from "@/types/shopify";

function throwIfUserErrors(errors: ShopifyUserError[] | null | undefined): void {
  if (errors?.length) {
    const msg = errors.map((e) => e.message).join("; ");
    throw new Error(`Shopify cart: ${msg}`);
  }
}

async function fetchCartOrThrow(cartId: string): Promise<ShopifyCart> {
  const full = await getShopifyCart(cartId);
  if (!full?.id) {
    throw new Error("Shopify cart: cart could not be loaded.");
  }
  return full;
}

export interface CartLineMerchandiseInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
}

export async function createShopifyCart(
  lines: CartLineMerchandiseInput[] = [],
): Promise<ShopifyCart> {
  const data = await shopifyStorefrontRequest<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: ShopifyUserError[];
    };
  }>(CART_CREATE_MUTATION, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: l.merchandiseId,
        quantity: l.quantity,
      })),
    },
  });

  throwIfUserErrors(data.cartCreate.userErrors);
  const cart = data.cartCreate.cart;
  if (!cart?.id) {
    throw new Error("Shopify cart: cartCreate returned no cart.");
  }
  return fetchCartOrThrow(cart.id);
}

export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyStorefrontRequest<{ cart: ShopifyCart | null }>(
    CART_QUERY,
    { cartId },
  );
  return data.cart ?? null;
}

export async function addLinesToShopifyCart(
  cartId: string,
  lines: CartLineMerchandiseInput[],
): Promise<ShopifyCart> {
  const data = await shopifyStorefrontRequest<{
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: ShopifyUserError[];
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: lines.map((l) => ({
      merchandiseId: l.merchandiseId,
      quantity: l.quantity,
    })),
  });

  throwIfUserErrors(data.cartLinesAdd.userErrors);
  const cart = data.cartLinesAdd.cart;
  if (!cart?.id) {
    throw new Error("Shopify cart: cartLinesAdd returned no cart.");
  }
  return fetchCartOrThrow(cart.id);
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: CartLineUpdateInput[],
): Promise<ShopifyCart> {
  const data = await shopifyStorefrontRequest<{
    cartLinesUpdate: {
      cart: ShopifyCart | null;
      userErrors: ShopifyUserError[];
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
  });

  throwIfUserErrors(data.cartLinesUpdate.userErrors);
  const cart = data.cartLinesUpdate.cart;
  if (!cart?.id) {
    throw new Error("Shopify cart: cartLinesUpdate returned no cart.");
  }
  return fetchCartOrThrow(cart.id);
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const data = await shopifyStorefrontRequest<{
    cartLinesRemove: {
      cart: ShopifyCart | null;
      userErrors: ShopifyUserError[];
    };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });

  throwIfUserErrors(data.cartLinesRemove.userErrors);
  const cart = data.cartLinesRemove.cart;
  if (!cart?.id) {
    throw new Error("Shopify cart: cartLinesRemove returned no cart.");
  }
  return fetchCartOrThrow(cart.id);
}
