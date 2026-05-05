# Punjabi Fashion Website

Production frontend for **Punjabi Fashion**, a Brampton South Asian clothing boutique. The active app is a Vite + React + TypeScript + Tailwind CSS website under `src/`.

## Tech stack

- [Vite](https://vitejs.dev/) — build tool and dev server  
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)  
- [Tailwind CSS](https://tailwindcss.com/)  
- [React Router](https://reactrouter.com/)  
- [TanStack Query](https://tanstack.com/query) app-wide provider
- UI primitives based on [Radix UI](https://www.radix-ui.com/) / shadcn patterns

## Prerequisites

- Node.js 18+ (20 LTS recommended)  
- npm (comes with Node)  

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

The dev server defaults to port `8080` (see `vite.config.ts`).

## Production build

```bash
npm run build
```

## Preview production build locally

```bash
npm run preview
```

## Deployment

For Netlify or Vercel-style static hosting:

- Build command: `npm run build`
- Publish directory: `dist`

Netlify SPA fallback is configured in `netlify.toml`.

## Project layout

Application code lives in **`src/`**. See `ACTIVE_APP.md` for the source-of-truth note and where to edit the UI.

This is a client-rendered storefront with **Stripe Checkout** (Netlify Function `create-checkout-session`) for payments. Checkout runs in **CAD** and collects email, phone, individual name, Canadian shipping address (Canada only), billing address when needed (`billing_address_collection: auto`), and **one shipping method**: either **Standard Delivery ($15)** or **Free Shipping** when the cart subtotal is **$340 CAD** or more — same rule as the cart drawer. Final taxes follow Stripe / store settings at checkout (no automatic tax enabled in code yet).

Not a substitute for store policy pages; adjust legal copy separately.
