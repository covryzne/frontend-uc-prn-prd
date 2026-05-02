import { APP_BASE_URL_API } from "./env";

const ENDPOINTS = {
  AUTH_LOGIN: `${APP_BASE_URL_API}/api/auth/login`,
  USERS_ME: `${APP_BASE_URL_API}/api/users/me`,
  USERS: `${APP_BASE_URL_API}/api/users/`,
  USER_BY_ID: (userId: string) => `${APP_BASE_URL_API}/api/users/${userId}`,
  USER_TOGGLE_ADMIN: (userId: string, isAdmin: boolean) =>
    `${APP_BASE_URL_API}/api/users/${userId}/toggle-admin?is_admin=${isAdmin}`,
  DATA_DOMAINS: `${APP_BASE_URL_API}/api/data/domains`,
  DATA_DASHBOARD: `${APP_BASE_URL_API}/api/data/stats/dashboard`,
  DATA_DOMAIN_DETAIL: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}`,
  DATA_DOMAIN_STATUS: (domainId: string) =>
    `${APP_BASE_URL_API}/api/data/domains/${domainId}/status`,
  INFERENCE_BULK: `${APP_BASE_URL_API}/api/inference/inference-bulk`,
  DATA_EXPORT_PORNO_CSV: `${APP_BASE_URL_API}/api/data/export-result/csv`,
  SCRAPE_START_CRAWL: `${APP_BASE_URL_API}/scrape/start-multi-crawling`,
  SCRAPE_CANCEL_CRAWL: `${APP_BASE_URL_API}/scrape/cancel-crawling`,
  SCRAPE_KEYWORDS: `${APP_BASE_URL_API}/scrape/keywords`,
  WHITELIST_DOMAINS: `${APP_BASE_URL_API}/api/whitelist`,
  WHITELIST_DOMAIN_BY_VALUE: (domain: string) =>
    `${APP_BASE_URL_API}/api/whitelist/${encodeURIComponent(domain)}`,
  SCHEDULES: `${APP_BASE_URL_API}/api/schedule`,
  SCHEDULE_START: (id: string) =>
    `${APP_BASE_URL_API}/api/schedule/start/${id}`,
  SCHEDULE_STOP: (id: string) => `${APP_BASE_URL_API}/api/schedule/stop/${id}`,
  SCHEDULE_RUN_NOW: (id: string) =>
    `${APP_BASE_URL_API}/api/schedule/run-now/${id}`,
  SCHEDULE_UPDATE: (id: string) =>
    `${APP_BASE_URL_API}/api/schedule/update/${id}`,
} as const;

export { ENDPOINTS };
export default ENDPOINTS;
