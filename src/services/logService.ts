import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/constants/endpoint";
import type { LogItem } from "@/types";

export type ServiceId =
  | "crawler"
  | "reasoning-ai"
  | "sft-hukum"
  | "computer-vision";

export interface ServiceHealthApiResponse {
  success: boolean;
  service_id: string;
  status: "ok" | "error" | "unknown";
  activity_state?: "crawling" | "idle" | "stopped"; // For crawler service
  response_time_ms?: number | null;
  health_url?: string | null;
  http_status?: number;
  message?: string;
  detail?: any;
}

export interface ServiceLogsApiResponse {
  success: boolean;
  service_id: string;
  tail: number;
  logs: LogItem[];
  source?: string;
  message?: string;
}

export async function fetchServiceHealth(serviceId: ServiceId) {
  return apiClient(ENDPOINTS.DATA_SERVICE_HEALTH(serviceId), {
    method: "GET",
  }) as Promise<ServiceHealthApiResponse>;
}

export async function fetchServiceLogs(
  serviceId: ServiceId,
  tail: number = 50,
) {
  return apiClient(ENDPOINTS.DATA_SERVICE_LOGS(serviceId, tail), {
    method: "GET",
  }) as Promise<ServiceLogsApiResponse>;
}
