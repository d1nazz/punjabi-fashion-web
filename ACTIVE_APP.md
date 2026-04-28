# Active application (source of truth)

## Stack

This project is **Vite + React + TypeScript** with **React Router**, **Tailwind CSS**, and client code under **`src/`**.

## Commands

| Script        | Command        | Purpose                    |
|---------------|----------------|----------------------------|
| Development   | `npm run dev`  | Vite dev server (port 8080) |
| Build         | `npm run build`| Production bundle to `dist/` |
| Preview       | `npm run preview` | Serve `dist/` locally   |

## Where to edit

- **All UI, routes, and business-facing frontend work:** `src/`  
- Entry: `src/main.tsx` → `src/App.tsx` (routes) → `src/pages/*` and `src/components/*`  
- Global styles: `src/index.css`  
- Vite + path alias `@` → `src/`: `vite.config.ts`, `tsconfig.app.json`  

## Inactive / legacy

There is **no separate Next.js `app/` tree** and **no legacy React app folder** in this repo. The `e2e/` directory is reserved for future Playwright tests (optional).

**Future UI and feature work should happen only under `src/`** unless you introduce a new documented entry (for example, a mobile app or API package).
