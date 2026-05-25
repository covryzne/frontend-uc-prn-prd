export type UserRole = "Admin" | "Verifikator";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  dibuat: string;
  login_terakhir: string;
  avatar_initial: string;
}

export interface DashboardSummary {
  total_url_crawled: number;
  total_domain: number;
  manual_check: number;
  pornografi: number;
  non_pornografi: number;
  verifikasi_hari_ini: number;
}

export interface TrenTemuan {
  tanggal: string;
  pornografi: number;
  non_pornografi: number;
  manual_check: number;
}

export interface DistribusiStatus {
  status: string;
  jumlah: number;
  warna: string;
}

export interface TopVerifikator {
  nama: string;
  total_verifikasi: number;
}

export interface VerifikasiTerakhirItem {
  waktu: string;
  domain: string;
  status: DomainStatus;
  verifikator: string;
}

export type DomainStatus = "Pornografi" | "Non-Pornografi" | "Manual Check";

export interface LatestCrawl {
  timestamp: string | null;
  url: string | null;
  status_code: number | null;
}

export interface LatestScraped {
  thumbnail: string | null;
  screenshot_path: string | null;
}

export interface LatestInference {
  vit_score: number | null;
  status: "porno" | "non_porno" | "manual_check" | null;
  overlay_image: string | null;
}

export interface LatestItem {
  crawl: LatestCrawl;
  scraped: LatestScraped | null;
  inference: LatestInference | null;
}

export interface DomainItem {
  id: string;
  timestamp: string;
  domain: string;
  status: DomainStatus;
  score: number | null;
  vitScore?: number | null;
  screenshot: string | null;
  verifikator: string | null;
  urlCount?: number;
}

export interface DomainDetailPage {
  url: string;
  status: DomainStatus;
  statusCode?: number | null;
  confidence_score: number;
  ai_reasoning: string;
  user_reasoning?: string;
  kata_kunci: string[];
  crawled_at: string;
  vit_score: number | null;
  screenshots: { url: string; caption: string }[];
  konten_terekstrak: string;
  latest?: LatestItem;
}

export interface DomainDetail {
  domain: string;
  url: string;
  status: DomainStatus;
  confidence_score: number;
  ai_reasoning: string;
  user_reasoning: string;
  kata_kunci: string[];
  crawled_at: string;
  vit_score: number | null;
  screenshots: { url: string; caption: string }[];
  konten_terekstrak: string;
  total_url_in_domain: number;
  grouped_pages?: DomainDetailPage[];
}

export interface ServiceStatus {
  nama: string;
  status: "Online" | "Offline" | "Unknown" | "Error";
  last_check: string | null;
  activity_state?: "crawling" | "idle" | "stopped"; // For crawler service detail
  message?: string; // Additional context message
}

export type LogStatus = "Ok" | "Error" | "Warning";

export interface LogItem {
  waktu: string;
  servis: string;
  status: LogStatus;
  detail: string;
}

export interface KeywordItem {
  no: number;
  keyword: string;
  id?: string;
}
