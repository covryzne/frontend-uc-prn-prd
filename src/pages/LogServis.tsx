import { useState } from "react";
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
import { mockServiceStatus, mockLogs } from "@/data/mockData";
import type { ServiceStatus } from "@/types";
import { RefreshCw, Server, CheckSquare } from "lucide-react";

export default function LogServis() {
  const [services, setServices] = useState<ServiceStatus[]>(mockServiceStatus);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [servisFilter, setServisFilter] = useState("Semua Servis");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const healthCheck = (nama?: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (nama && s.nama !== nama) return s;
        const statuses: ServiceStatus["status"][] = [
          "Online",
          "Offline",
          "Error",
        ];
        return {
          ...s,
          status: statuses[
            Math.floor(Math.random() * 2)
          ] as ServiceStatus["status"],
          last_check: new Date().toISOString(),
        };
      }),
    );
  };

  const filteredLogs = mockLogs.filter((l) => {
    if (search && !l.detail.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter !== "Semua Status" && l.status !== statusFilter)
      return false;
    if (servisFilter !== "Semua Servis" && l.servis !== servisFilter)
      return false;
    return true;
  });

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
            onClick={() => healthCheck()}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
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
                  {s.last_check
                    ? `Checked: ${new Date(s.last_check).toLocaleTimeString("id-ID")}`
                    : "Belum dicek"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => healthCheck(s.nama)}
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
              {[
                "Semua Servis",
                "Crawler",
                "Reasoning AI",
                "SFT Hukum",
                "Computer Vision",
              ].map((s) => (
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
                    <th className="p-3 font-medium text-muted-foreground">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map((l, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-xs text-muted-foreground font-mono-code whitespace-nowrap">
                        {new Date(l.waktu).toLocaleString("id-ID", {
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
                      <td className="p-3 text-xs text-muted-foreground max-w-[300px] truncate">
                        {l.detail}
                      </td>
                    </tr>
                  ))}
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
