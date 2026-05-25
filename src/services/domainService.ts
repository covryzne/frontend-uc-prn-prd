import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/services/apiClient";

export type ApiDomainStatus = "porno" | "non_porno" | "manual_check";

export interface LatestCrawlApi {
  timestamp: string | null;
  url: string | null;
  status_code: number | null;
}

export interface LatestScrapedApi {
  thumbnail: string | null;
  screenshot_path: string | null;
}

export interface LatestInferenceApi {
  vit_score: number | null;
  status: ApiDomainStatus | null;
  overlay_image: string | null;
}

export interface LatestItemApi {
  crawl: LatestCrawlApi;
  scraped: LatestScrapedApi | null;
  inference: LatestInferenceApi | null;
}

export interface DomainListItemApi {
  id: string;
  domain: string;
  latest: LatestItemApi;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  url_count: number;
}

export interface DomainListResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: DomainListItemApi[];
}

export interface DomainDetailItemApi {
  crawl_id: string;
  keyword: string | null;
  confidence_score: number | null;
  reasoning: string | null;
  inner_text: string | null;
  latest: LatestItemApi;
}

export interface DomainDetailResponse {
  success: boolean;
  domain_id: string;
  domain_name: string;
  reasoning_verificator: string | null;
  crawls: DomainDetailItemApi[];
}

export interface UpdateDomainStatusPayload {
  status: ApiDomainStatus;
  reasoning_verificator?: string;
  verifier_user_id?: string;
  verifier_name?: string;
}

export interface BulkInferencePayload {
  domain_ids: string[];
  tld_whitelist?: string;
  run_ocr?: boolean;
}

export interface BulkInferenceResponse {
  success: boolean;
  processed: string[];
  skipped: string[];
  failed: string[];
  reason: string;
}

export async function fetchDomains(params: {
  search?: string;
  status?: ApiDomainStatus;
  verification_status?: "verified" | "unverified";
  time_from?: string;
  time_to?: string;
  sort_by?: "timestamp" | "domain" | "score" | "vit_score";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.verification_status)
    query.set("verification_status", params.verification_status);
  if (params.time_from) query.set("time_from", params.time_from);
  if (params.time_to) query.set("time_to", params.time_to);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.order) query.set("order", params.order);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const url = `${ENDPOINTS.DATA_DOMAINS}?${query.toString()}`;
  return apiClient(url) as Promise<DomainListResponse>;
}

export async function fetchDomainDetail(domainId: string) {
  return apiClient(
    ENDPOINTS.DATA_DOMAIN_DETAIL(domainId),
  ) as Promise<DomainDetailResponse>;
}

export async function updateDomainStatus(
  domainId: string,
  payload: UpdateDomainStatusPayload,
) {
  return apiClient(ENDPOINTS.DATA_DOMAIN_STATUS(domainId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<{ success: boolean; message: string; updated_count: number }>;
}

export async function runBulkInference(payload: BulkInferencePayload) {
  return apiClient(ENDPOINTS.INFERENCE_BULK, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<BulkInferenceResponse>;
}

export function buildExportUrl(params?: {
  statuses?: string;
  verification_status?: string;
  time_from?: string;
  time_to?: string;
  columns?: string;
}) {
  const query = new URLSearchParams();
  if (params?.statuses) query.set("statuses", params.statuses);
  if (params?.verification_status)
    query.set("verification_status", params.verification_status);
  if (params?.time_from) query.set("time_from", params.time_from);
  if (params?.time_to) query.set("time_to", params.time_to);
  if (params?.columns) query.set("columns", params.columns);

  const qs = query.toString();
  return qs
    ? `${ENDPOINTS.DATA_EXPORT_PORNO_CSV}?${qs}`
    : ENDPOINTS.DATA_EXPORT_PORNO_CSV;
}
