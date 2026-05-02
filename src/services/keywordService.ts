import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/constants/endpoint";

export interface KeywordResponse {
  id: string;
  keyword: string;
}

export interface QueueSummary {
  pending: number;
  processing: number;
  done: number;
  failed: number;
}

export interface KeywordListResponse {
  success: boolean;
  data: KeywordResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  schedule?: string;
  crawl_engine?: string;
  queue_summary?: QueueSummary;
}

export interface DeleteKeywordResponse {
  success: boolean;
  message: string;
  id: string;
}

/**
 * Fetch all keywords from backend
 */
export async function fetchKeywords(page: number = 1, limit: number = 100) {
  const url = `${ENDPOINTS.SCRAPE_KEYWORDS}?page=${page}&limit=${limit}`;
  return apiClient(url, { method: "GET" }) as Promise<KeywordListResponse>;
}

/**
 * Create a single keyword
 */
export async function createKeyword(keyword: string) {
  return apiClient(ENDPOINTS.SCRAPE_KEYWORDS, {
    method: "POST",
    body: JSON.stringify({ keyword }),
  }) as Promise<KeywordResponse>;
}

/**
 * Update a keyword by ID
 */
export async function updateKeyword(keywordId: string, keyword: string) {
  const url = `${ENDPOINTS.SCRAPE_KEYWORDS}/${keywordId}`;
  return apiClient(url, {
    method: "PUT",
    body: JSON.stringify({ keyword }),
  }) as Promise<KeywordResponse>;
}

/**
 * Delete a keyword by ID
 */
export async function deleteKeyword(keywordId: string) {
  const url = `${ENDPOINTS.SCRAPE_KEYWORDS}/${keywordId}`;
  return apiClient(url, { method: "DELETE" }) as Promise<DeleteKeywordResponse>;
}
