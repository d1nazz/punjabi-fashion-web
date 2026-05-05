import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import catalog from './_data/checkout-catalog.json';

type CatalogEntry = {
  id: string;
  slug: string;
  name: string;
  price: number;
  sku: string;
  sizes: string[];
  currency: string;
  inStock: boolean;
  colorOptions?: string[];
  stitchingOptions?: string[];
};

const catalogById = new Map<string, CatalogEntry>(
  (catalog as CatalogEntry[]).map((entry) => [entry.id, entry]),
);

type IncomingLine = {
  productId?: unknown;
  quantity?: unknown;
  selectedOptions?: {
    size?: unknown;
    color?: unknown;
    stitchingType?: unknown;
  };
};

type ParsedLine = {
  productId: string;
  quantity: number;
  selectedOptions: {
    size: string;
    color?: string;
    stitchingType?: string;
  };
};

const MAX_QTY = 50;

/** Cart subtotal (goods only) in CAD cents — sync with `src/constants/shipping.ts` display amount. */
const FREE_SHIPPING_THRESHOLD_CENTS = 34000;
const STANDARD_SHIPPING_CENTS = 1500;
const SHIPPING_COUNTRIES = ['CA'] as const;

const cors: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Content-Type': 'application/json',
};

function siteUrl(event: Parameters<Handler>[0]): string {
  const fromEnv = process.env.SITE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const host = event.headers['x-forwarded-host'] ?? event.headers.host ?? '';
  const proto = event.headers['x-forwarded-proto'] ?? 'https';
  if (host) return `${proto}://${host}`;
  return 'http://localhost:8080';
}

function optionsDescription(selected: ParsedLine['selectedOptions']): string {
  const parts: string[] = [];
  parts.push(selected.size ? `Size: ${selected.size}` : '');
  parts.push(selected.color ? `Colour: ${selected.color}` : '');
  parts.push(selected.stitchingType ? `Stitching: ${selected.stitchingType}` : '');
  return parts.filter(Boolean).join(' · ');
}

function parseBody(raw: string | null): { ok: true; items: IncomingLine[] } | { ok: false; message: string } {
  try {
    if (!raw) return { ok: false, message: 'Missing request body.' };
    const data = JSON.parse(raw) as { items?: unknown };
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return { ok: false, message: 'Your cart is empty.' };
    }
    return { ok: true, items: data.items as IncomingLine[] };
  } catch {
    return { ok: false, message: 'Invalid request body.' };
  }
}

function validateAndNormalize(lines: IncomingLine[]): { ok: true; normalized: ParsedLine[] } | { ok: false; message: string } {
  const normalized: ParsedLine[] = [];

  for (const raw of lines) {
    const productId = typeof raw.productId === 'string' ? raw.productId.trim() : '';
    const qtyRaw = raw.quantity;
    const qty =
      typeof qtyRaw === 'number' && Number.isFinite(qtyRaw)
        ? Math.floor(qtyRaw)
        : typeof qtyRaw === 'string'
          ? Math.floor(Number(qtyRaw))
          : NaN;

    if (!productId) return { ok: false, message: 'Something in your cart is invalid.' };
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      return { ok: false, message: 'Please choose a valid quantity for each item.' };
    }

    const opts = raw.selectedOptions;

    const size = typeof opts?.size === 'string' ? opts.size.trim() : '';
    if (!size) {
      return { ok: false, message: 'Each item requires a valid size.' };
    }

    const colorRaw = opts?.color;
    const color = typeof colorRaw === 'string' && colorRaw.trim() ? colorRaw.trim() : undefined;

    const stitchRaw = opts?.stitchingType;
    const stitching =
      typeof stitchRaw === 'string' && stitchRaw.trim() ? stitchRaw.trim() : undefined;

    const entry = catalogById.get(productId);
    if (!entry || !entry.inStock) {
      return { ok: false, message: 'Something in your cart is no longer available.' };
    }

    if (entry.currency !== 'CAD') {
      return { ok: false, message: 'Checkout is only available in CAD right now.' };
    }

    if (!entry.sizes.includes(size)) {
      return { ok: false, message: 'Something in your cart has an invalid option. Please revisit the product page.' };
    }

    if (entry.colorOptions && entry.colorOptions.length > 1) {
      if (!color || !entry.colorOptions.includes(color)) {
        return { ok: false, message: 'Colour selection is required for one or more items.' };
      }
    }

    if (entry.stitchingOptions && entry.stitchingOptions.length > 1) {
      if (!stitching || !entry.stitchingOptions.includes(stitching)) {
        return { ok: false, message: 'A stitching selection is required for one or more items.' };
      }
    }

    normalized.push({
      productId,
      quantity: qty,
      selectedOptions: {
        size,
        color,
        stitchingType: stitching,
      },
    });
  }

  return { ok: true, normalized };
}

function serverCartSubtotalCents(lines: ParsedLine[]): number {
  let total = 0;
  for (const line of lines) {
    const entry = catalogById.get(line.productId);
    if (!entry) continue;
    total += Math.round(entry.price * 100) * line.quantity;
  }
  return total;
}

function buildShippingOptions(
  subtotalCents: number,
): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  const deliveryEstimate: Stripe.Checkout.SessionCreateParams.ShippingOption.ShippingRateData.DeliveryEstimate =
    {
      minimum: { unit: 'business_day', value: 3 },
      maximum: { unit: 'business_day', value: 7 },
    };

  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Free Shipping',
          fixed_amount: { amount: 0, currency: 'cad' },
          delivery_estimate: deliveryEstimate,
        },
      },
    ];
  }

  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        display_name: 'Standard Delivery',
        fixed_amount: { amount: STANDARD_SHIPPING_CENTS, currency: 'cad' },
        delivery_estimate: deliveryEstimate,
      },
    },
  ];
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 503,
      headers: cors,
      body: JSON.stringify({ error: 'Checkout is not configured yet. Please contact the store.' }),
    };
  }

  const parsed = parseBody(event.body);
  if (!parsed.ok) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: parsed.message }),
    };
  }

  const normalizedResult = validateAndNormalize(parsed.items);
  if (!normalizedResult.ok) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: normalizedResult.message }),
    };
  }

  const stripe = new Stripe(secretKey);
  const base = siteUrl(event);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const line of normalizedResult.normalized) {
    const entry = catalogById.get(line.productId);
    if (!entry) continue;

    const unitCents = Math.round(entry.price * 100);

    lineItems.push({
      quantity: line.quantity,
      price_data: {
        currency: 'cad',
        unit_amount: unitCents,
        product_data: {
          name: entry.name,
          description: optionsDescription(line.selectedOptions) || undefined,
          metadata: {
            productId: entry.id,
            slug: entry.slug,
            sku: entry.sku,
            source: 'punjabi-fashion-web',
          },
        },
      },
    });
  }

  if (!lineItems.length) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'Could not validate your cart.' }),
    };
  }

  const normalizedLines = normalizedResult.normalized;
  const cartSubtotalCents = serverCartSubtotalCents(normalizedLines);
  const itemCount = normalizedLines.reduce((sum, line) => sum + line.quantity, 0);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_creation: 'always',
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [...SHIPPING_COUNTRIES],
      },
      name_collection: {
        individual: { enabled: true },
      },
      shipping_options: buildShippingOptions(cartSubtotalCents),
      line_items: lineItems,
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`,
      payment_method_types: ['card'],
      automatic_tax: { enabled: false },
      metadata: {
        source: 'punjabi-fashion-web',
        cartSubtotalCents: String(cartSubtotalCents),
        shippingPolicy: 'standard_15_free_over_340',
        itemCount: String(itemCount),
        currency: 'cad',
      },
    });

    if (!session.url) {
      throw new Error('Missing session URL');
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ url: session.url }),
    };
  } catch {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({
        error: 'Checkout could not start. Please try again or contact the store.',
      }),
    };
  }
};
