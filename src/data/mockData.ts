import type {
  User, DashboardSummary, TrenTemuan, DistribusiStatus,
  TopVerifikator, VerifikasiTerakhirItem, DomainItem, DomainDetail,
  ServiceStatus, LogItem, KeywordItem
} from "@/types";

export const mockUsers: User[] = [
  { id: 1, nama: "Admin Komdigi", email: "admin@komdigi.go.id", role: "Admin", dibuat: "2026-01-10", login_terakhir: "2026-03-20", avatar_initial: "A" },
  { id: 2, nama: "User Biasa Komdigi", email: "user@komdigi.go.id", role: "Verifikator", dibuat: "2026-01-11", login_terakhir: "2026-03-05", avatar_initial: "U" },
  { id: 3, nama: "Verifikator Satu", email: "verifikator1@komdigi.go.id", role: "Verifikator", dibuat: "2026-02-01", login_terakhir: "2026-03-19", avatar_initial: "V" },
];

export const mockDashboardSummary: DashboardSummary = {
  total_url_crawled: 4206, total_domain: 1498, manual_check: 287,
  pornografi: 915, non_pornografi: 296, verifikasi_hari_ini: 0,
};

export const mockTrenTemuan: TrenTemuan[] = [
  { tanggal: "2026-02-15", pornografi: 120, non_pornografi: 45, manual_check: 30 },
  { tanggal: "2026-02-16", pornografi: 135, non_pornografi: 52, manual_check: 28 },
  { tanggal: "2026-02-17", pornografi: 98, non_pornografi: 40, manual_check: 35 },
  { tanggal: "2026-02-18", pornografi: 150, non_pornografi: 60, manual_check: 42 },
  { tanggal: "2026-02-19", pornografi: 142, non_pornografi: 55, manual_check: 38 },
  { tanggal: "2026-02-20", pornografi: 130, non_pornografi: 48, manual_check: 32 },
  { tanggal: "2026-02-21", pornografi: 140, non_pornografi: 50, manual_check: 82 },
];

export const mockDistribusi: DistribusiStatus[] = [
  { status: "Pornografi", jumlah: 915, warna: "#EF4444" },
  { status: "Non-Pornografi", jumlah: 296, warna: "#22C55E" },
  { status: "Manual Check", jumlah: 287, warna: "#F59E0B" },
];

export const mockTopVerifikator: TopVerifikator[] = [
  { nama: "Admin Komdigi", total_verifikasi: 342 },
  { nama: "Verifikator A", total_verifikasi: 285 },
  { nama: "Verifikator B", total_verifikasi: 198 },
  { nama: "User Biasa Komdigi", total_verifikasi: 145 },
  { nama: "Verifikator C", total_verifikasi: 102 },
];

export const mockVerifikasiTerakhir: VerifikasiTerakhirItem[] = [
  { waktu: "2026-02-21 14:30:00", domain: "situs-xxx-online.com", status: "Pornografi", verifikator: "Admin Komdigi" },
  { waktu: "2026-02-21 14:25:00", domain: "education-portal.ac.id", status: "Non-Pornografi", verifikator: "Verifikator A" },
  { waktu: "2026-02-21 14:20:00", domain: "suspicious-site.xyz", status: "Manual Check", verifikator: "Verifikator B" },
  { waktu: "2026-02-21 14:15:00", domain: "adult-content-hub.net", status: "Pornografi", verifikator: "Admin Komdigi" },
  { waktu: "2026-02-21 14:10:00", domain: "berita-terkini.co.id", status: "Non-Pornografi", verifikator: "Verifikator A" },
];

export const mockDomains: DomainItem[] = [
  { id: 1, timestamp: "2026-02-25 07:27:00", domain: "situs-porno-online.com", status: "Pornografi", score: 99.55, screenshot: "/screenshots/domain1.png", verifikator: "Admin Komdigi" },
  { id: 2, timestamp: "2026-02-25 07:15:00", domain: "adult-streaming.xyz", status: "Pornografi", score: 97.80, screenshot: "/screenshots/domain2.png", verifikator: "Verifikator A" },
  { id: 3, timestamp: "2026-02-25 06:50:00", domain: "portal-berita.co.id", status: "Non-Pornografi", score: 5.20, screenshot: "/screenshots/domain3.png", verifikator: "Verifikator B" },
  { id: 4, timestamp: "2026-02-25 06:30:00", domain: "suspicious-images.net", status: "Manual Check", score: 65.40, screenshot: "/screenshots/domain4.png", verifikator: null },
  { id: 5, timestamp: "2026-02-24 22:10:00", domain: "university-portal.ac.id", status: "Non-Pornografi", score: 2.10, screenshot: "/screenshots/domain5.png", verifikator: "Admin Komdigi" },
  { id: 6, timestamp: "2026-02-24 21:00:00", domain: "konten-dewasa.org", status: "Pornografi", score: 95.30, screenshot: "/screenshots/domain6.png", verifikator: "Verifikator A" },
  { id: 7, timestamp: "2026-02-24 20:45:00", domain: "news-daily.co.id", status: "Non-Pornografi", score: 3.10, screenshot: "/screenshots/domain7.png", verifikator: "Admin Komdigi" },
  { id: 8, timestamp: "2026-02-24 19:30:00", domain: "ambiguous-content.net", status: "Manual Check", score: 55.20, screenshot: "/screenshots/domain8.png", verifikator: null },
  { id: 9, timestamp: "2026-02-24 18:15:00", domain: "explicit-media.xyz", status: "Pornografi", score: 98.70, screenshot: "/screenshots/domain9.png", verifikator: "Verifikator A" },
  { id: 10, timestamp: "2026-02-24 17:00:00", domain: "blog-personal.com", status: "Non-Pornografi", score: 8.40, screenshot: "/screenshots/domain10.png", verifikator: "Verifikator B" },
  { id: 11, timestamp: "2026-02-24 16:00:00", domain: "streaming-xxx.net", status: "Pornografi", score: 99.10, screenshot: "/screenshots/domain11.png", verifikator: "Admin Komdigi" },
  { id: 12, timestamp: "2026-02-24 15:00:00", domain: "forum-diskusi.or.id", status: "Non-Pornografi", score: 1.50, screenshot: "/screenshots/domain12.png", verifikator: "Verifikator B" },
];

export const mockDomainDetail: DomainDetail = {
  domain: "situs-porno-online.com",
  url: "https://situs-porno-online.com/page1",
  status: "Pornografi",
  confidence_score: 99.55,
  ai_reasoning: "Konten mengandung gambar eksplisit dan kata kunci terkait konten dewasa, menunjukkan aktivitas pornografi.",
  user_reasoning: "",
  kata_kunci: ["explicit", "adult", "xxx", "nude"],
  crawled_at: "2026-02-25T07:27:00",
  vit_score: 99.55,
  screenshots: [
    { url: "/screenshots/domain1-1.png", caption: "Screenshot of situs-porno-online.com 1" },
    { url: "/screenshots/domain1-2.png", caption: "Screenshot of situs-porno-online.com 2" },
  ],
  konten_terekstrak: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  total_url_in_domain: 2,
};

export const mockServiceStatus: ServiceStatus[] = [
  { nama: "Crawler", status: "Unknown", last_check: null },
  { nama: "Reasoning AI", status: "Unknown", last_check: null },
  { nama: "SFT Hukum", status: "Unknown", last_check: null },
  { nama: "Computer Vision", status: "Unknown", last_check: null },
];

export const mockLogs: LogItem[] = [
  { waktu: "2026-03-19T20:27:24", servis: "Reasoning AI", status: "Error", detail: "Resource not found" },
  { waktu: "2026-03-19T20:07:28", servis: "SFT Hukum", status: "Ok", detail: "Health check passed" },
  { waktu: "2026-03-19T19:55:10", servis: "Crawler", status: "Ok", detail: "Crawl batch #4521 completed - 150 URLs processed" },
  { waktu: "2026-03-19T19:30:45", servis: "Computer Vision", status: "Warning", detail: "High memory usage detected (85%)" },
  { waktu: "2026-03-19T19:15:00", servis: "Reasoning AI", status: "Ok", detail: "Model inference batch completed - 50 domains analyzed" },
  { waktu: "2026-03-19T18:45:30", servis: "Crawler", status: "Error", detail: "Connection timeout to target domain" },
  { waktu: "2026-03-19T18:30:00", servis: "SFT Hukum", status: "Ok", detail: "Classification batch completed" },
  { waktu: "2026-03-19T18:00:15", servis: "Computer Vision", status: "Ok", detail: "ViT model loaded successfully" },
  { waktu: "2026-03-19T17:45:00", servis: "Crawler", status: "Ok", detail: "Crawl batch #4520 completed - 200 URLs processed" },
  { waktu: "2026-03-19T17:30:22", servis: "Reasoning AI", status: "Error", detail: "GPU memory overflow - batch size reduced" },
];

export const mockKeywords: KeywordItem[] = [
  { no: 1, keyword: "situs porno indonesia" },
  { no: 2, keyword: "video dewasa online" },
  { no: 3, keyword: "streaming adult content" },
  { no: 4, keyword: "bokep online terbaru" },
  { no: 5, keyword: "film dewasa gratis" },
  { no: 6, keyword: "website pornografi" },
  { no: 7, keyword: "konten eksplisit online" },
  { no: 8, keyword: "situs adult streaming" },
  { no: 9, keyword: "video porno free" },
  { no: 10, keyword: "adult website indonesia" },
  { no: 11, keyword: "situs dewasa terbaru" },
  { no: 12, keyword: "konten pornografi gratis" },
];

export const defaultWhitelist = [".ac.id", ".go.id", ".or.id", ".sch.id", ".mil.id", ".desa.id"];
export const defaultSearchEngines = ["Google", "Baidu"];
export const searchEngineOptions = ["Google", "Baidu", "Bing", "Yahoo", "DuckDuckGo"];
export const crawlScheduleOptions = [
  "Setiap 15 menit", "Setiap 30 menit", "Setiap 1 jam",
  "Setiap 6 jam", "Setiap 12 jam", "Setiap 24 jam",
];
