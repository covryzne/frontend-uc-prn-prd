import { APP_BASE_URL_API } from "./env";

const ENDPOINTS = {
  AUTH_LOGIN: `${APP_BASE_URL_API}/api/auth/login`,
  USERS_ME: `${APP_BASE_URL_API}/api/users/me`,
  USERS: `${APP_BASE_URL_API}/api/users/`,
  USER_BY_ID: (userId: string) => `${APP_BASE_URL_API}/api/users/${userId}`,
  USER_TOGGLE_ADMIN: (userId: string, isAdmin: boolean) =>
    `${APP_BASE_URL_API}/api/users/${userId}/toggle-admin?is_admin=${isAdmin}`,
  DATA_DOMAINS: `${APP_BASE_URL_API}/api/data/domains`,
  DATA_DOMAIN_DETAIL: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}`,
  DATA_DOMAIN_STATUS: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}/status`,
  DATA_EXPORT_PORNO_CSV: `${APP_BASE_URL_API}/api/data/export-result/csv`,
} as const;

export default ENDPOINTS;
