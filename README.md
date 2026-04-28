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

This is a static frontend: no live payments, inventory backend, or third-party commerce integrations are wired in yet.
