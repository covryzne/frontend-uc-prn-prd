import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceLogTerminal } from "@/components/shared/ServiceLogTerminal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ServiceStatus } from "@/types";
import { RefreshCw, Server, CheckSquare } from "lucide-react";
import { fetchServiceHealth, type ServiceId } from "@/services/logService";
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
  const [isLoadingServices, setIsLoadingServices] = useState(false);

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

  useEffect(() => {
    refreshServiceHealth();
  }, [refreshServiceHealth]);

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
            onClick={() => refreshServiceHealth()}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            disabled={isLoadingServices}
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

      {/* Log Terminal */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Log Aktivitas Crawler</h3>
        <ServiceLogTerminal
          serviceId="crawler"
          serviceName="Crawler"
          autoRefreshInterval={3000}
        />
      </div>
    </div>
  );
}
