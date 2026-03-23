import { useMemo, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import {
  mockDomains,
  mockDomainDetail,
  mockDomainDetailsByDomain,
} from "@/data/mockData";
import type { DomainStatus, DomainItem } from "@/types";
import {
  Download,
  ListChecks,
  Eye,
  ImageIcon,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function VerifikasiDomain() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);
  const [userReasoning, setUserReasoning] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<DomainStatus>("Pornografi");
  const selectedDomainDetail = selectedDomain
    ? (mockDomainDetailsByDomain[selectedDomain.domain] ?? mockDomainDetail)
    : mockDomainDetail;
  const groupedPages = selectedDomainDetail.grouped_pages ?? [];
  const [selectedDetailUrl, setSelectedDetailUrl] = useState(
    selectedDomainDetail.grouped_pages?.[0]?.url ?? selectedDomainDetail.url,
  );
  const detailData = groupedPages.length
    ? (groupedPages.find((page) => page.url === selectedDetailUrl) ??
      groupedPages[0])
    : selectedDomainDetail;
  const detailPages = groupedPages.length ? groupedPages : [mockDomainDetail];
  const activePageIndex = Math.max(
    0,
    detailPages.findIndex((page) => page.url === selectedDetailUrl),
  );
  const activeScreenshot = detailData.screenshots[0];
  type SortField = "timestamp" | "domain" | "score";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const uniqueDomains = useMemo(() => {
    const byDomain = new Map<string, DomainItem>();

    for (const item of mockDomains) {
      const existing = byDomain.get(item.domain);
      if (!existing) {
        byDomain.set(item.domain, item);
        continue;
      }

      if (
        new Date(item.timestamp).getTime() >
        new Date(existing.timestamp).getTime()
      ) {
        byDomain.set(item.domain, item);
      }
    }

    return Array.from(byDomain.values());
  }, []);

  const filtered = useMemo(() => {
    return uniqueDomains.filter((d) => {
      if (search && !d.domain.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter, uniqueDomains]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortField === "timestamp") {
        return (
          (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) *
          direction
        );
      }
      if (sortField === "domain") {
        return a.domain.localeCompare(b.domain) * direction;
      }
      return (a.score - b.score) * direction;
    });
  }, [filtered, sortField, sortDirection]);

  const total = sorted.length;
  const paginated = useMemo(() => {
    return sorted.slice((page - 1) * perPage, page * perPage);
  }, [sorted, page, perPage]);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((d) => d.id)));
  };

  const setDetailByUrl = (url: string) => {
    setSelectedDetailUrl(url);
    const selectedPage = detailPages.find((page) => page.url === url);
    if (selectedPage) setVerifyStatus(selectedPage.status as DomainStatus);
  };

  const goToRelativePage = (direction: -1 | 1) => {
    if (detailPages.length <= 1) return;
    const nextIndex =
      (activePageIndex + direction + detailPages.length) % detailPages.length;
    setDetailByUrl(detailPages[nextIndex].url);
  };

  const openDetail = (d: DomainItem) => {
    const domainDetail =
      mockDomainDetailsByDomain[d.domain] ?? mockDomainDetail;
    const firstUrl = domainDetail.grouped_pages?.[0]?.url ?? domainDetail.url;
    const firstStatus =
      domainDetail.grouped_pages?.[0]?.status ?? domainDetail.status;
    setSelectedDomain(d);
    setVerifyStatus(firstStatus as DomainStatus);
    setUserReasoning("");
    setSelectedDetailUrl(firstUrl);
    setDetailOpen(true);
  };
  const [isReasoningPending, setIsReasoningPending] = useState(false);
  const handleBulkReasoning = async () => {
    if (!selectedIds.size) return;
    setIsReasoningPending(true);
    const pendingDomains = mockDomains.filter(
      (d) => selectedIds.has(d.id) && d.status === "Manual Check",
    );
    if (!pendingDomains.length) {
      setIsReasoningPending(false);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsReasoningPending(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <p className="text-sm text-muted-foreground">
        Kelola dan verifikasi hasil crawling domain
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Cari domain..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:flex-1"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Semua", "Pornografi", "Non-Pornografi", "Manual Check"].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Daftar Domain ({total.toLocaleString("id-ID")})
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedIds(new Set());
            }}
          >
            <ListChecks className="h-4 w-4 mr-1" />
            {bulkMode ? "Batal" : "Bulk Action"}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Pornografi
          </Button>
        </div>
      </div>

      {bulkMode && selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm">{selectedIds.size} dipilih —</span>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleBulkReasoning}
              disabled={isReasoningPending}
            >
              {isReasoningPending ? "Memproses..." : "Lakukan AI Reasoning"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  {bulkMode && (
                    <th className="p-3">
                      <Checkbox
                        checked={
                          selectedIds.size === paginated.length &&
                          paginated.length > 0
                        }
                        onCheckedChange={toggleAll}
                      />
                    </th>
                  )}
                  <th
                    className="p-3 font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort("timestamp")}
                  >
                    <span>Timestamp</span>
                    <span className="ml-1 text-xs">
                      {renderSortIndicator("timestamp")}
                    </span>
                  </th>
                  <th
                    className="p-3 font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort("domain")}
                  >
                    <span>Domain</span>
                    <span className="ml-1 text-xs">
                      {renderSortIndicator("domain")}
                    </span>
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th
                    className="p-3 font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort("score")}
                  >
                    <span>Score</span>
                    <span className="ml-1 text-xs">
                      {renderSortIndicator("score")}
                    </span>
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Screenshot
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Verifikator
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {bulkMode && (
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.has(d.id)}
                          onCheckedChange={() => toggleSelect(d.id)}
                        />
                      </td>
                    )}
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(d.timestamp).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      , {d.timestamp.slice(11, 16)}
                    </td>
                    <td className="p-3 font-mono text-xs max-w-[200px] truncate">
                      {d.domain}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={d.score} className="w-16 h-1.5" />
                        <span className="text-xs tabular-nums">{d.score}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {(() => {
                          const domainDetail =
                            mockDomainDetailsByDomain[d.domain] ??
                            mockDomainDetail;
                          const grouped = domainDetail.grouped_pages ?? [];
                          const lastPage =
                            grouped.length > 0
                              ? grouped[grouped.length - 1]
                              : domainDetail;
                          const lastScreenshot = lastPage.screenshots?.[0];

                          return lastScreenshot ? (
                            <img
                              src={lastScreenshot.url}
                              alt={d.domain}
                              className="h-8 w-12 rounded object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          );
                        })()}
                        <p className="text-[10px] text-muted-foreground leading-none">
                          {(
                            mockDomainDetailsByDomain[d.domain]
                              ?.total_url_in_domain ?? 1
                          ).toLocaleString("id-ID")}{" "}
                          URL
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-xs">
                      {d.verifikator ?? (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => openDetail(d)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative pr-20">
            <div className="absolute right-12 top-0">
              <Select
                value={verifyStatus}
                onValueChange={(v) => setVerifyStatus(v as DomainStatus)}
              >
                <SelectTrigger className="h-auto w-auto gap-1 rounded-full border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-80">
                  <StatusBadge status={verifyStatus} />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Pornografi",
                      "Non-Pornografi",
                      "Manual Check",
                    ] as DomainStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-base">
                {selectedDomain?.domain}
              </span>
              {verifyStatus !== detailData.status && (
                <Button
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDetailOpen(false)}
                  aria-label="Simpan verifikasi"
                >
                  <Save className="h-3.5 w-3.5" />
                </Button>
              )}
            </DialogTitle>
            {groupedPages.length > 0 ? (
              <Select value={selectedDetailUrl} onValueChange={setDetailByUrl}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pilih URL" />
                </SelectTrigger>
                <SelectContent>
                  {groupedPages.map((page) => (
                    <SelectItem key={page.url} value={page.url}>
                      {page.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-muted-foreground truncate">
                {selectedDetailUrl}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-5">
            {/* AI Analysis */}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Confidence Score</h4>
                <div className="mt-1 flex items-center gap-2">
                  <Progress
                    value={detailData.confidence_score}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-semibold tabular-nums">
                    {detailData.confidence_score}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">AI Reasoning</h4>
              <div>
                <p className="mt-1 text-sm bg-muted/50 rounded-md p-3">
                  {detailData.ai_reasoning}
                </p>
              </div>
            </div>

            {/* User Verification */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">User Reasoning</h4>
              <div>
                {/* <Label htmlFor="reason" className="text-xs">
                  Reasoning Anda
                </Label> */}
                <Textarea
                  id="reason"
                  placeholder="Masukkan reasoning Anda..."
                  value={userReasoning}
                  onChange={(e) => setUserReasoning(e.target.value)}
                  className="mt-1"
                  disabled
                />
              </div>
            </div>

            {/* Additional info */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Kata Kunci Terdeteksi</h4>
              <div className="flex flex-wrap gap-1.5">
                {detailData.kata_kunci.map((k) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium"
                  >
                    {k}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Waktu Crawl:</span>{" "}
                  {new Date(detailData.crawled_at).toLocaleString("id-ID")}
                </div>
                <div>
                  <span className="text-muted-foreground">ViT Score:</span>{" "}
                  {detailData.vit_score}%
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">
                {mockDomainDetail.total_url_in_domain} URL dalam domain ini
              </h4>
              <div className="relative rounded-lg bg-muted aspect-video overflow-hidden border">
                {activeScreenshot ? (
                  <img
                    src={activeScreenshot.url}
                    alt={activeScreenshot.caption}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/90 hover:bg-background"
                  onClick={() => goToRelativePage(-1)}
                  disabled={detailPages.length <= 1}
                  aria-label="Previous URL"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/90 hover:bg-background"
                  onClick={() => goToRelativePage(1)}
                  disabled={detailPages.length <= 1}
                  aria-label="Next URL"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                URL {activePageIndex + 1} dari {detailPages.length}
              </p>
            </div>

            {/* Extracted content */}
            <details className="border-t pt-4">
              <summary className="text-sm font-semibold cursor-pointer">
                Konten Terekstrak
              </summary>
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3 font-mono-code text-xs">
                {detailData.konten_terekstrak}
              </p>
            </details>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
