import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/services/apiClient";

export interface StartCrawlPayload {
  keywords: string[];
  crawl_engine: string;
  ai_reasoning: boolean;
  tld_whitelist?: string;
}

export interface StartCrawlResponse {
  success: boolean;
  message: string;
  crawl_id?: string;
}

export interface CancelCrawlResponse {
  success: boolean;
  message: string;
  canceled?: boolean;
}

export async function startCrawl(payload: StartCrawlPayload) {
  return apiClient(ENDPOINTS.SCRAPE_START_CRAWL, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<StartCrawlResponse>;
}

export async function cancelCrawl() {
  return apiClient(ENDPOINTS.SCRAPE_CANCEL_CRAWL, {
    method: "POST",
  }) as Promise<CancelCrawlResponse>;
}
