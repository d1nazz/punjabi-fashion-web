# Shopify migration plan — Punjabi Fashion (punjabifashion.ca)

This document matches the **Punjabi Fashion** Vite/React codebase: local catalog in `src/data/products.ts`, cart in `src/contexts/StoreContext.tsx`, and Stripe Checkout via `netlify/functions/create-checkout-session.ts`.

## Target architecture

```text
Custom frontend (this repo)
    → Shopify Storefront API (products, collections, cart — browser-safe token)
    → Shopify Checkout (`checkoutUrl` from Cart API)
    → Shopify Admin (orders, customers, payments, inventory)
    → Chit Chats (labels / fulfillment workflow — operational layer outside this repo)
```

- **Never** put Shopify Admin API tokens in Vite env or client bundles. Storefront tokens are scoped for public storefront use only.

## Phased rollout

| Phase | Goal | Code / ops |
| ----- | ---- | ---------- |
| **0** | Safety + foundation | `src/config/commerce.ts` defaults to `local-stripe`. Shopify services exist under `src/services/shopify/` but are **not** wired into ProductCard, PDP, or cart unless `VITE_COMMERCE_BACKEND=shopify` and you explicitly integrate. |
| **1** | Read-only proof | Call `getShopifyShop()` / `getShopifyProducts()` from a dev-only path or temporary page **after** Storefront token exists; confirm `2025-01` (or chosen version) and domain. |
| **2** | Product mapping | Use `src/utils/shopifyMappers.ts` (`StorefrontProductCardData`, `StorefrontProductDetailData`) to feed existing components without forcing parity with `Product` in `products.ts`. Replace **one** low-risk homepage/section first; keep local fallback. |
| **3** | Collections + PDP | Route category/collection pages to Shopify `collection(handle:)`. PDP loads `product(handle:)`. Match **handles** to current slugs where possible (see open questions). Loading/error states required. |
| **4** | Cart | Shopify Cart API; persist `cartId` in `localStorage`; line updates via Shopify line IDs; subtotal from `cart.cost`. Keep wishlist local if needed. |
| **5** | Checkout | Primary CTA → `cart.checkoutUrl`. Shopify collects address, tax, shipping, payment. Orders in Admin. |
| **6** | Remove Stripe | Only after Shopify checkout is verified end-to-end: remove Netlify function, `generate-checkout-catalog`, Stripe env docs/deps, success/cancel paths tied to Stripe. |
| **7** | Fulfillment / Chit Chats | Shopify order is system of record; staff creates Chit Chats labels (manual or app/export). Fulfillment + tracking updated in Shopify. |

## Environment variables

Documented in **`.env.example`** (never commit real tokens).

| Variable | Purpose |
| -------- | ------- |
| `VITE_COMMERCE_BACKEND` | `local-stripe` (default) or `shopify` (opt-in). Invalid values fall back to `local-stripe`. |
| `VITE_SHOPIFY_STORE_DOMAIN` | Storefront API hostname for this store (verified: `vsmauk-m2.myshopify.com`; no `https://`). |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token from Shopify Admin (**allowed** in the browser for Storefront API only). |
| `VITE_SHOPIFY_API_VERSION` | e.g. `2025-01` — must match the app’s tested API behavior. |

**Security notes**

- Storefront token: scoped, still treat as sensitive; rotate if leaked.
- Admin API token: **server-only** (future Netlify functions or separate backend), never `VITE_*`.

## Products and variants

- Legacy `Product` in `src/data/products.ts` includes merchandising fields (occasion, tags, `hidden`, etc.) that Shopify may not mirror on day one.
- Prefer **`StorefrontProductCardData` / `StorefrontProductDetailData`** from `src/utils/shopifyMappers.ts` as the migration bridge.
- Variant options (size, color, stitching, one-size accessories) must be decided in Shopify Admin and aligned with PDP selectors.

## Collection handle strategy

- Map each marketing category to a Shopify collection **handle** (often aligned with current URL slugs like `lehengas`, `party-wear`).
- Document a **handle map** (slug → Shopify collection handle) before switching category pages.
- Use `getShopifyCollectionByHandle()` in `src/services/shopify/products.ts` when integrating.

## Cart and checkout strategy

- Foundation helpers: `src/services/shopify/cart.ts` (`createShopifyCart`, `getShopifyCart`, `addLinesToShopifyCart`, etc.).
- Cart mutations require **variant GIDs** as `merchandiseId`.
- Checkout: redirect to Shopify-provided `checkoutUrl` — no Admin API on the client.

## Stripe removal timing

- **Do not remove** Stripe until Phase 5 is validated in staging/production with real or test orders.
- `prebuild` still runs `generate:checkout-catalog` for Netlify checkout today; Phase 6 removes that coupling.

## Chit Chats fulfillment

- Orders originate in Shopify after checkout migration.
- Initial process: manual label creation from order details, or Shopify app / export workflow — **to be confirmed** with operations.

## What to configure in Shopify (before go-live)

- Products, variants, images, CAD prices, inventory policies.
- Shipping zones (Canada-first if required), rates or free-shipping rules aligned with business ($340 threshold if still required).
- Taxes (Shopify settings / registrations).
- **Shopify Payments** (or alternative) and checkout customization.
- Custom domain connection for Shopify **if** storefront URLs must be on Shopify hostname (coordinate with `punjabifashion.ca` headless setup).
- Headless / Hydrogen not required — this site remains custom React.

## Testing checklist (foundation)

- [ ] `npm run build` succeeds with default env (no Shopify vars).
- [ ] With Storefront token + domain in `.env.local` (local only): `getShopifyShop()` returns shop name.
- [ ] `getShopifyProductByHandle` returns null vs product for a known handle.
- [ ] Cart create + add line smoke test in browser console or temp dev page (optional).
- [ ] No Admin API calls or tokens in `src/`.

## Unanswered questions

See the **exact checklist** in the implementation report / project chat (20 items: checkout vs Stripe, handles, inventory UX, shipping, Chit Chats, wishlist persistence, etc.).

## Repo files added for this foundation

- `src/config/commerce.ts` — backend mode flag.
- `src/types/shopify.ts` — lean GraphQL-oriented types.
- `src/services/shopify/*` — client, queries, products, cart, barrel export.
- `src/utils/shopifyMappers.ts` — UI-oriented mapping helpers.
- `.env.example` — Shopify placeholders and security notes.
