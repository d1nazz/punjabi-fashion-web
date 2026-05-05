import type { CartLineItem } from '@/types/commerce';
import type { CheckoutLineRequest, CheckoutRequestBody } from '@/types/commerce';

const CHECKOUT_ENDPOINT = '/.netlify/functions/create-checkout-session';

function functionsBase(): string {
  const raw = import.meta.env.VITE_FUNCTIONS_BASE_URL as string | undefined;
  return raw ? raw.replace(/\/$/, '') : '';
}

export function cartLinesToCheckoutPayload(lines: CartLineItem[]): CheckoutRequestBody['items'] {
  return lines.map(
    (l): CheckoutLineRequest => ({
      productId: l.productId,
      quantity: l.quantity,
      selectedOptions: {
        size: l.selectedOptions.size,
        color: l.selectedOptions.color,
        stitchingType: l.selectedOptions.stitchingType,
      },
    }),
  );
}

/** Starts Stripe-hosted Checkout redirect (session created server-side). */
export async function startStripeCheckoutSession(
  lines: CartLineItem[],
): Promise<{ url: string } | { error: string }> {
  const body: CheckoutRequestBody = { items: cartLinesToCheckoutPayload(lines) };

  const base = functionsBase();
  let res: Response;
  try {
    res = await fetch(`${base}${CHECKOUT_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return { error: 'Checkout could not start. Please try again or contact the store.' };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { error: 'Checkout could not start. Please try again or contact the store.' };
  }

  const errObj = json as { error?: string };
  const okObj = json as { url?: string };

  if (!res.ok) {
    return { error: errObj.error ?? 'Checkout could not start. Please try again or contact the store.' };
  }
  if (typeof okObj.url !== 'string' || !okObj.url) {
    return { error: 'Checkout could not start. Please try again or contact the store.' };
  }
  return { url: okObj.url };
}
