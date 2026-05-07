import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import ENDPOINTS from "@/constants/endpoint";
import { apiClient } from "@/services/apiClient";
import {
  Link2,
  Globe,
  Search,
  Ban,
  CheckCircle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type DashboardSummary = {
  total_url_crawled: number;
  total_domain: number;
  manual_check: number;
  pornografi: number;
  non_pornografi: number;
  verifikasi_hari_ini: number;
};

type DashboardTrend = {
  tanggal: string;
  pornografi: number;
  non_pornografi: number;
  manual_check: number;
};

type DashboardDistribution = {
  status: string;
  jumlah: number;
  warna: string;
};

type DashboardVerifikator = {
  nama: string;
  total_verifikasi: number;
};

type DashboardRecent = {
  waktu: string;
  domain: string;
  status: string;
  verifikator: string;
};

type DashboardResponse = {
  updated_at?: string;
  summary?: Partial<DashboardSummary>;
  trend?: DashboardTrend[];
  trendUrl?: DashboardTrend[];
  distribution?: DashboardDistribution[];
  top_verifikator?: DashboardVerifikator[];
  recent?: DashboardRecent[];
};

type BackendDashboardResponse = {
  success?: boolean;
  data?: {
    updated_at?: string;
    summary?: Partial<DashboardSummary>;
    trend?: DashboardTrend[];
    trendUrl?: DashboardTrend[];
    distribution?: DashboardDistribution[];
    top_verifikator?: DashboardVerifikator[];
    recent?: DashboardRecent[];
  };
  updatedAt?: string;
  stats?: {
    totalDomains?: number;
    totalUrls?: number;
    manualCheckCount?: number;
    pornoCount?: number;
    nonPornoCount?: number;
    todayVerified?: number;
  };
  trend?: {
    domain?: Array<{
      dateKey?: string;
      porno?: number;
      nonPorno?: number;
      manualCheck?: number;
    }>;
    url?: Array<{
      dateKey?: string;
      porno?: number;
      nonPorno?: number;
      manualCheck?: number;
    }>;
  };
  verifikatorStats?: Array<{
    name?: string;
    count?: number;
  }>;
  recentDomains?: Array<{
    verifiedAt?: string;
    domain?: string;
    status?: string;
    verifiedBy?: string;
  }>;
};

function normalizeDashboardResponse(
  payload: BackendDashboardResponse,
): DashboardResponse {
  if (payload.data) {
    return {
      ...payload.data,
      updated_at: payload.data.updated_at ?? payload.updatedAt,
    };
  }

  const stats = payload.stats ?? {};
  const domainTrend = (payload.trend?.domain ?? []).map((row) => ({
    tanggal: row.dateKey ?? "",
    pornografi: row.porno ?? 0,
    non_pornografi: row.nonPorno ?? 0,
    manual_check: row.manualCheck ?? 0,
  }));
  const urlTrend = (payload.trend?.url ?? []).map((row) => ({
    tanggal: row.dateKey ?? "",
    pornografi: row.porno ?? 0,
    non_pornografi: row.nonPorno ?? 0,
    manual_check: row.manualCheck ?? 0,
  }));

  return {
    updated_at: payload.updatedAt,
    summary: {
      total_url_crawled: stats.totalUrls ?? 0,
      total_domain: stats.totalDomains ?? 0,
      manual_check: stats.manualCheckCount ?? 0,
      pornografi: stats.pornoCount ?? 0,
      non_pornografi: stats.nonPornoCount ?? 0,
      verifikasi_hari_ini: stats.todayVerified ?? 0,
    },
    trend: domainTrend,
    trendUrl: urlTrend,
    distribution: [
      {
        status: "pornografi",
        jumlah: stats.pornoCount ?? 0,
        warna: "#EF4444",
      },
      {
        status: "non_pornografi",
        jumlah: stats.nonPornoCount ?? 0,
        warna: "#22C55E",
      },
      {
        status: "manual_check",
        jumlah: stats.manualCheckCount ?? 0,
        warna: "#F59E0B",
      },
    ],
    top_verifikator: (payload.verifikatorStats ?? []).map((item) => ({
      nama: item.name ?? "",
      total_verifikasi: item.count ?? 0,
    })),
    recent: (payload.recentDomains ?? []).map((item) => ({
      waktu: item.verifiedAt ?? "",
      domain: item.domain ?? "",
      status: item.status ?? "",
      verifikator: item.verifiedBy ?? "",
    })),
  };
}

const WIB_TIME_ZONE = "Asia/Jakarta";

const formatWibDateTime = (value?: string): string => {
  if (!value) return "-";
  const normalizedValue =
    value.includes(" ") && !value.includes("T")
      ? value.replace(" ", "T")
      : value;
  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: WIB_TIME_ZONE,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(parsed) + " WIB"
  );
};

const summaryCards = [
  {
    key: "total_url_crawled" as const,
    icon: Link2,
    color: "text-primary",
  },
  {
    key: "total_domain" as const,
    icon: Globe,
    color: "text-primary",
  },
  {
    key: "manual_check" as const,
    icon: Search,
    color: "text-warning",
  },
  {
    key: "pornografi" as const,
    icon: Ban,
    color: "text-destructive",
  },
  {
    key: "non_pornografi" as const,
    icon: CheckCircle,
    color: "text-success",
  },
  {
    key: "verifikasi_hari_ini" as const,
    icon: ClipboardList,
    color: "text-muted-foreground",
  },
];

const getCardLabel = (key: string, isAdmin: boolean): string => {
  if (isAdmin) {
    const adminLabels: Record<string, string> = {
      total_url_crawled: "Total URL Crawled",
      total_domain: "Total Domain",
      manual_check: "Manual Check",
      pornografi: "Pornografi",
      non_pornografi: "Non-Pornografi",
      verifikasi_hari_ini: "Verifikasi Hari Ini",
    };
    return adminLabels[key] ?? key;
  } else {
    const userLabels: Record<string, string> = {
      total_url_crawled: "Total URLs Verified",
      total_domain: "Total Domains Verified",
      manual_check: "Manual Check",
      pornografi: "Pornografi",
      non_pornografi: "Non-Pornografi",
      verifikasi_hari_ini: "Verifikasi Hari Ini",
    };
    return userLabels[key] ?? key;
  }
};

export default function Dashboard() {
  const { user, token, authReady } = useAuth();
  const [trendFilter, setTrendFilter] = useState("Domain");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const selectedTrend =
    trendFilter === "URL" ? (data?.trendUrl ?? []) : (data?.trend ?? []);

  // Debug: log when filter or data changes to help diagnose URL vs Domain trend
  useEffect(() => {
    try {
      console.log("trendFilter changed:", trendFilter);
      console.log("domain trend length:", data?.trend?.length ?? 0);
      console.log("url trend length:", data?.trendUrl?.length ?? 0);
      console.log("selectedTrend length:", selectedTrend.length);
    } catch (e) {
      /* ignore */
    }
  }, [trendFilter, data]);

  const isAdmin = user?.role === "Admin";

  // Role-based summary cards
  const visibleSummaryCards = isAdmin ? summaryCards : summaryCards.slice(0, 5); // USER: hide "Top Verifikator" preview, show key metrics

  useEffect(() => {
    // Only fetch when both authReady and token are available
    if (!authReady || !token) {
      return;
    }

    let isMounted = true;
    let intervalId: number | undefined;

    const fetchDashboard = async () => {
      try {
        const json = (await apiClient(
          ENDPOINTS.DATA_DASHBOARD,
        )) as BackendDashboardResponse;
        console.log("Dashboard API response:", json);
        if (isMounted) {
          const normalized = normalizeDashboardResponse(json);
          setData({
            ...normalized,
            updated_at: normalized.updated_at ?? new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        if (isMounted) setData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // initial fetch
    fetchDashboard();

    // poll every 15s
    intervalId = window.setInterval(() => {
      fetchDashboard();
    }, 15000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [authReady, token]);

  const handleSyncClick = async () => {
    if (!authReady || !token) return;
    setIsSyncing(true);
    try {
      await apiClient(ENDPOINTS.DATA_DASHBOARD_SYNC, { method: "POST" });
      // Immediately refresh local view
      const refreshed = (await apiClient(
        ENDPOINTS.DATA_DASHBOARD,
      )) as BackendDashboardResponse;
      setData(normalizeDashboardResponse(refreshed));
    } catch (err) {
      console.error("Dashboard sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading || !authReady || !token) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            Selamat datang, {user?.nama}!{" "}
            {isAdmin
              ? "Berikut ringkasan monitoring sistem."
              : "Berikut ringkasan aktivitas verifikasi Anda."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Update terakhir: {formatWibDateTime(data?.updated_at)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncClick}
          disabled={isSyncing}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isSyncing ? "Syncing..." : "Sync Data"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div
        className={`grid gap-3 ${
          isAdmin
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        }`}
      >
        {visibleSummaryCards.map((c) => (
          <Card key={c.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {getCardLabel(c.key, isAdmin)}
                </span>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {(data?.summary?.[c.key] ?? 0).toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tren Temuan */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">
                {isAdmin ? "Tren Temuan Sistem" : "Tren Temuan Pribadi"}
              </h3>
              <Select
                value={trendFilter}
                onValueChange={(value: string) => {
                  console.log("Trend Select changed:", value);
                  console.log(
                    "data.trend (domain) sample:",
                    data?.trend?.slice(0, 3),
                  );
                  console.log(
                    "data.trendUrl (url) sample:",
                    data?.trendUrl?.slice(0, 3),
                  );
                  setTrendFilter(value);
                }}
                onOpenChange={(open) => console.log("Trend Select open:", open)}
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Domain"
                    onClick={() => console.log("SelectItem click: Domain")}
                  >
                    Domain
                  </SelectItem>
                  <SelectItem
                    value="URL"
                    onClick={() => console.log("SelectItem click: URL")}
                  >
                    URL
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={selectedTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="tanggal"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="pornografi"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  name="Pornografi"
                />
                <Line
                  type="monotone"
                  dataKey="non_pornografi"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  name="Non-Pornografi"
                />
                <Line
                  type="monotone"
                  dataKey="manual_check"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  name="Manual Check"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribusi Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">
              {isAdmin ? "Distribusi Status Sistem" : "Distribusi Status Anda"}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.distribution ?? []}
                  dataKey="jumlah"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ status, percent }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  fontSize={10}
                >
                  {(data?.distribution ?? []).map((d, i) => (
                    <Cell key={i} fill={d.warna} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div
        className={`grid gap-4 ${isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}
      >
        {/* Top Verifikator - ADMIN ONLY */}
        {isAdmin && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4">Top Verifikator</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data?.top_verifikator ?? []}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="nama"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar
                    dataKey="total_verifikasi"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    name="Total Verifikasi"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Verifikasi Terakhir */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">
              {isAdmin ? "Verifikasi Terakhir" : "Aktivitas Verifikasi Anda"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Waktu</th>
                    <th className="pb-2 font-medium">Domain</th>
                    <th className="pb-2 font-medium">Status</th>
                    {isAdmin && (
                      <th className="pb-2 font-medium">Verifikator</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent ?? []).length > 0 ? (
                    (data?.recent ?? []).map((v, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                          {formatWibDateTime(v.waktu)}
                        </td>
                        <td className="py-2 font-mono text-xs max-w-[160px] truncate">
                          {v.domain}
                        </td>
                        <td className="py-2">
                          <StatusBadge status={v.status} />
                        </td>
                        {isAdmin && (
                          <td className="py-2 text-xs">{v.verifikator}</td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isAdmin ? 4 : 3}
                        className="py-4 text-center text-muted-foreground text-sm"
                      >
                        {isAdmin
                          ? "Belum ada aktivitas verifikasi"
                          : "Anda belum melakukan verifikasi apapun"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
