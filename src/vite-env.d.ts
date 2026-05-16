/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMERCE_BACKEND?: string;
  readonly VITE_SHOPIFY_STORE_DOMAIN?: string;
  readonly VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN?: string;
  readonly VITE_SHOPIFY_API_VERSION?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_FUNCTIONS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
