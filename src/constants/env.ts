const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined);

export const APP_BASE_URL_API = rawApiUrl.replace(/\/$/, "");

export const APP_NAME = import.meta.env.VITE_APP_NAME as string | undefined;
export const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN as string | undefined;
export const APP_COOKIE_NAME = import.meta.env.VITE_APP_COOKIE_NAME as
  | string
  | undefined;

export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;
