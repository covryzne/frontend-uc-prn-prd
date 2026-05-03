import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import type { LogItem, ServiceStatus } from "@/types";
import { RefreshCw, Server, CheckSquare } from "lucide-react";
import {
  fetchServiceHealth,
  fetchServiceLogs,
  type ServiceId,
} from "@/services/logService";
import { useToast } from "@/hooks/use-toast";

const SERVICE_DEFS: Array<{ id: ServiceId; nama: string }> = [
  { id: "crawler", nama: "Crawler" },
  // TODO: Enable other services when ready
  // { id: "reasoning-ai", nama: "Reasoning AI" },
  // { id: "sft-hukum", nama: "SFT Hukum" },
  // { id: "computer-vision", nama: "Computer Vision" },
];

export default function LogServis() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICE_DEFS.map((s) => ({
      nama: s.nama,
      status: "Unknown",
      last_check: null,
    })),
  );
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [servisFilter, setServisFilter] = useState("Semua Servis");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const mapHealthStatus = (
    status: string,
    activityState?: string,
  ): ServiceStatus["status"] => {
    // For crawler service, map activity_state to display status
    if (activityState === "stopped") return "Offline"; // Scheduler stopped
    if (activityState === "crawling") return "Online"; // Actively crawling
    if (activityState === "idle") return "Online"; // Ready but idle

    // For other services
    if (status === "ok") return "Online";
    if (status === "error") return "Error";
    return "Unknown";
  };

  const refreshServiceHealth = useCallback(
    async (targetNama?: string) => {
      try {
        setIsLoadingServices(true);
        const targets = SERVICE_DEFS.filter(
          (s) => !targetNama || s.nama === targetNama,
        );
        const healthResults = await Promise.all(
          targets.map((s) => fetchServiceHealth(s.id)),
        );

        const byName = new Map<string, ServiceStatus>();
        healthResults.forEach((res) => {
          const def = SERVICE_DEFS.find((s) => s.id === res.service_id);
          if (!def) return;
          byName.set(def.nama, {
            nama: def.nama,
            status: mapHealthStatus(res.status, res.activity_state),
            last_check: new Date().toISOString(),
            activity_state: res.activity_state,
            message: res.message,
          });
        });

        setServices((prev) =>
          prev.map((s) => {
            const updated = byName.get(s.nama);
            return updated ?? s;
          }),
        );
      } catch (error) {
        console.error("Failed to check service health:", error);
        toast({
          title: "Gagal melakukan health check",
          description:
            error instanceof Error ? error.message : "Tidak bisa cek service.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingServices(false);
      }
    },
    [toast],
  );

  const refreshLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      const responses = await Promise.all(
        SERVICE_DEFS.map((s) => fetchServiceLogs(s.id, 100)),
      );
      const merged = responses.flatMap((res) => res.logs || []);
      merged.sort(
        (a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime(),
      );
      setLogs(merged);
    } catch (error) {
      console.error("Failed to load service logs:", error);
      toast({
        title: "Gagal memuat log servis",
        description:
          error instanceof Error ? error.message : "Tidak bisa mengambil log.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshServiceHealth();
    refreshLogs();
  }, [refreshLogs, refreshServiceHealth]);

  const filteredLogs = useMemo(
    () =>
      logs.filter((l) => {
        if (search && !l.detail.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (statusFilter !== "Semua Status" && l.status !== statusFilter)
          return false;
        if (servisFilter !== "Semua Servis" && l.servis !== servisFilter)
          return false;
        return true;
      }),
    [logs, search, statusFilter, servisFilter],
  );

  const totalLogs = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Monitoring status dan log aktivitas servis
      </p>

      {/* Service Health */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshServiceHealth();
              refreshLogs();
            }}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            disabled={isLoadingServices || isLoadingLogs}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Health Check Semua
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map((s) => (
            <Card key={s.nama} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{s.nama}</span>
                  </div>
                  <StatusBadge status={s.status} type="service" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.message ||
                    (s.last_check
                      ? `Checked: ${new Date(s.last_check).toLocaleTimeString("id-ID")}`
                      : "Belum dicek")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => refreshServiceHealth(s.nama)}
                  disabled={isLoadingServices}
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Check
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Log Aktivitas Worker</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Cari log..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-xs"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Semua Status", "Ok", "Error", "Warning"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={servisFilter}
            onValueChange={(v) => {
              setServisFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Semua Servis", ...SERVICE_DEFS.map((s) => s.nama)].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-3 font-medium text-muted-foreground">
                      Waktu
                    </th>
                    <th className="p-3 font-medium text-muted-foreground">
                      Servis
                    </th>
                    <th className="p-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {isLoadingLogs ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Loading logs...
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Belum ada log yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((l, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 text-xs text-muted-foreground font-mono-code whitespace-nowrap">
                          {new Date(l.waktu).toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                        </td>
                        <td className="p-3 text-xs font-medium">{l.servis}</td>
                        <td className="p-3">
                          <StatusBadge status={l.status} type="log" />
                        </td>
                        {/* <td className="p-3 text-xs text-muted-foreground max-w-[300px] truncate">
                          {l.detail}
                        </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Pagination
          total={totalLogs}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          perPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
