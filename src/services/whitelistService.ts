import { apiClient } from "@/lib/apiClient";
import { ENDPOINTS } from "@/constants/endpoint";

export async function fetchWhitelistDomains() {
  return apiClient(ENDPOINTS.WHITELIST_DOMAINS, {
    method: "GET",
  }) as Promise<string[]>;
}

export async function createWhitelistDomain(domain: string) {
  return apiClient(ENDPOINTS.WHITELIST_DOMAINS, {
    method: "POST",
    body: JSON.stringify({ domain }),
  }) as Promise<{ success: boolean; domain: string; created: boolean }>;
}

export async function deleteWhitelistDomain(domain: string) {
  return apiClient(ENDPOINTS.WHITELIST_DOMAIN_BY_VALUE(domain), {
    method: "DELETE",
  }) as Promise<{ success: boolean; domain: string; deleted: boolean }>;
}

