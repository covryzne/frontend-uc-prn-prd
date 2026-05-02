import { useEffect, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import type {
  DomainDetail,
  DomainDetailPage,
  DomainItem,
  DomainStatus,
} from "@/types";
import {
  buildExportUrl,
  fetchDomainDetail,
  fetchDomains,
  runBulkInference,
  updateDomainStatus,
} from "@/services/domainService";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);
  const [userReasoning, setUserReasoning] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<DomainStatus>("Pornografi");
  const [selectedDetailUrl, setSelectedDetailUrl] = useState("");
  const [domainDetail, setDomainDetail] = useState<DomainDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const groupedPages = domainDetail?.grouped_pages ?? [];
  const detailPages = groupedPages.length
    ? groupedPages
    : domainDetail
      ? [domainDetail]
      : [];
  const detailData = detailPages.length
    ? (detailPages.find((page) => page.url === selectedDetailUrl) ??
      detailPages[0])
    : null;
  const activePageIndex = Math.max(
    0,
    detailPages.findIndex((page) => page.url === selectedDetailUrl),
  );
  const activeScreenshot = detailData?.screenshots?.[0];
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
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [total, setTotal] = useState(0);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === domains.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(domains.map((d) => d.id)));
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
    setSelectedDomain(d);
    setUserReasoning("");
    setDetailOpen(true);
  };
  const [isReasoningPending, setIsReasoningPending] = useState(false);
  const handleBulkReasoning = async () => {
    if (!selectedIds.size) return;
    setIsReasoningPending(true);
    const pendingDomains = domains.filter(
      (d) => selectedIds.has(d.id) && d.status === "Manual Check",
    );
    if (!pendingDomains.length) {
      setIsReasoningPending(false);
      return;
    }

    try {
      const response = await runBulkInference({
        domain_ids: pendingDomains.map((d) => d.id),
        run_ocr: true,
      });

      console.log("Bulk inference result:", response);
      setSelectedIds(new Set());
      setBulkMode(false);
      setRefreshTick((prev) => prev + 1);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Bulk inference gagal dijalankan",
      );
    } finally {
      setIsReasoningPending(false);
    }
  };

  const mapApiStatusToDomainStatus = (value?: string | null): DomainStatus => {
    if (!value) return "Manual Check";
    if (value === "porno" || value === "Pornografi") return "Pornografi";
    if (value === "non_porno" || value === "Non-Pornografi")
      return "Non-Pornografi";
    return "Manual Check";
  };

  const mapDomainStatusToApi = (value: DomainStatus) => {
    if (value === "Pornografi") return "porno";
    if (value === "Non-Pornografi") return "non_porno";
    return "manual_check";
  };

  const normalizeScore = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Number(normalized.toFixed(1))));
  };

  const buildDetailFromApi = (payload: {
    domain_id: string;
    domain_name: string;
    reasoning_verificator?: string | null;
    crawls: Array<{
      url: string;
      status: string | null;
      confidence_score: number | null;
      reasoning: string | null;
      keyword: string | null;
      timestamp: string | null;
      vit_score: number | null;
      screenshot: string | null;
      inner_text: string | null;
    }>;
  }): DomainDetail => {
    const pages: DomainDetailPage[] = payload.crawls.map((crawl) => ({
      url: crawl.url,
      status: mapApiStatusToDomainStatus(crawl.status),
      confidence_score: normalizeScore(crawl.confidence_score),
      ai_reasoning: crawl.reasoning ?? "-",
      user_reasoning: payload.reasoning_verificator ?? "",
      kata_kunci: crawl.keyword ? [crawl.keyword] : [],
      crawled_at: crawl.timestamp ?? new Date().toISOString(),
      vit_score: normalizeScore(crawl.vit_score),
      screenshots: crawl.screenshot
        ? [{ url: crawl.screenshot, caption: "Crawl screenshot" }]
        : [],
      konten_terekstrak: crawl.inner_text ?? "-",
    }));

    const firstPage = pages[0];
    return {
      domain: payload.domain_name,
      url: firstPage?.url ?? "",
      status: firstPage?.status ?? "Manual Check",
      confidence_score: firstPage?.confidence_score ?? 0,
      ai_reasoning: firstPage?.ai_reasoning ?? "-",
      user_reasoning: payload.reasoning_verificator ?? "",
      kata_kunci: firstPage?.kata_kunci ?? [],
      crawled_at: firstPage?.crawled_at ?? new Date().toISOString(),
      vit_score: firstPage?.vit_score ?? 0,
      screenshots: firstPage?.screenshots ?? [],
      konten_terekstrak: firstPage?.konten_terekstrak ?? "-",
      total_url_in_domain: pages.length,
      grouped_pages: pages,
    };
  };

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

    const apiStatus =
      statusFilter === "Semua"
        ? undefined
        : mapDomainStatusToApi(statusFilter as DomainStatus);

    fetchDomains({
      search: search || undefined,
      status: apiStatus,
      sort_by: sortField ?? undefined,
      order: sortField ? sortDirection : undefined,
      page,
      limit: perPage,
    })
      .then((response) => {
        if (!active) return;
        const mapped = response.data.map((item) => ({
          id: item.id,
          domain: item.domain,
          timestamp: item.timestamp?.[0] ?? new Date().toISOString(),
          status: mapApiStatusToDomainStatus(item.status?.[0]),
          score: normalizeScore(item.finalScore),
          screenshot: item.screenshot?.[0] ?? null,
          verifikator: item.verifiedBy?.[0] ?? null,
          urlCount: item.url_count,
        }));
        setDomains(mapped);
        setTotal(response.total);
      })
      .catch((error: Error) => {
        if (!active) return;
        setDomains([]);
        setTotal(0);
        setLoadError(error.message || "Gagal memuat data domain");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    search,
    statusFilter,
    page,
    perPage,
    sortField,
    sortDirection,
    refreshTick,
  ]);

  useEffect(() => {
    if (!selectedDomain) return;
    let active = true;
    setDetailLoading(true);
    setDetailError(null);

    fetchDomainDetail(selectedDomain.id)
      .then((response) => {
        if (!active) return;
        const mapped = buildDetailFromApi(response);
        setDomainDetail(mapped);
        setVerifyStatus(mapped.status);
        setUserReasoning(mapped.user_reasoning ?? "");
        setSelectedDetailUrl(mapped.grouped_pages?.[0]?.url ?? mapped.url);
      })
      .catch((error: Error) => {
        if (!active) return;
        setDomainDetail(null);
        setDetailError(error.message || "Gagal memuat detail domain");
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDomain]);

  const handleSaveStatus = async () => {
    if (!selectedDomain) return;
    setIsSaving(true);
    try {
      await updateDomainStatus(selectedDomain.id, {
        status: mapDomainStatusToApi(verifyStatus),
        reasoning_verificator: userReasoning || undefined,
      });
      setDetailOpen(false);
      setRefreshTick((prev) => prev + 1);
    } catch (error) {
      setDetailError(
        error instanceof Error ? error.message : "Gagal menyimpan status",
      );
    } finally {
      setIsSaving(false);
    }
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
            onClick={() => {
              window.open(buildExportUrl({ statuses: "porno" }), "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Pornografi
          </Button>
        </div>
      </div>

      {loadError && (
        <Card>
          <CardContent className="p-3 text-sm text-destructive">
            {loadError}
          </CardContent>
        </Card>
      )}

      {bulkMode && selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm">{selectedIds.size} dipilih</span>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleBulkReasoning}
              disabled={isReasoningPending}
            >
              {isReasoningPending ? "Memproses..." : "Lakukan Inference Model"}
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
                          selectedIds.size === domains.length &&
                          domains.length > 0
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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={bulkMode ? 8 : 7}
                      className="p-6 text-center text-xs text-muted-foreground"
                    >
                      Memuat data domain...
                    </td>
                  </tr>
                ) : domains.length === 0 ? (
                  <tr>
                    <td
                      colSpan={bulkMode ? 8 : 7}
                      className="p-6 text-center text-xs text-muted-foreground"
                    >
                      Tidak ada data domain.
                    </td>
                  </tr>
                ) : (
                  domains.map((d) => (
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
                          <span className="text-xs tabular-nums">
                            {d.score}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {d.screenshot ? (
                            <img
                              src={d.screenshot}
                              alt={d.domain}
                              className="h-8 w-12 rounded object-cover border"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-8 w-12 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground leading-none">
                            {(d.urlCount ?? 0).toLocaleString("id-ID")} URL
                          </p>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        {d.verifikator ?? (
                          <span className="text-muted-foreground italic">
                            —
                          </span>
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
                  ))
                )}
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
              {verifyStatus !== detailData?.status && (
                <Button
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSaveStatus}
                  aria-label="Simpan verifikasi"
                  disabled={isSaving || detailLoading}
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
                {selectedDetailUrl || "-"}
              </p>
            )}
          </DialogHeader>

          {detailError && (
            <Card>
              <CardContent className="p-3 text-sm text-destructive">
                {detailError}
              </CardContent>
            </Card>
          )}

          <div className="space-y-5">
            {/* AI Analysis */}

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Confidence Score</h4>
                <div className="mt-1 flex items-center gap-2">
                  <Progress
                    value={detailData?.confidence_score ?? 0}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-semibold tabular-nums">
                    {detailData?.confidence_score ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="space-y-3">
              <h4 className="text-sm font-semibold">AI Reasoning</h4>
              <div>
                <p className="mt-1 text-sm bg-muted/50 rounded-md p-3">
                  {detailData.ai_reasoning}
                </p>
              </div>
            </div> */}

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
                />
              </div>
            </div>

            {/* Additional info */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Kata Kunci Terdeteksi</h4>
              <div className="flex flex-wrap gap-1.5">
                {(detailData?.kata_kunci ?? []).map((k) => (
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
                  {detailData?.crawled_at
                    ? new Date(detailData.crawled_at).toLocaleString("id-ID")
                    : "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">ViT Score:</span>{" "}
                  {detailData?.vit_score ?? 0}%
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">
                {domainDetail?.total_url_in_domain ?? 0} URL dalam domain ini
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
                {detailData?.konten_terekstrak ?? "-"}
              </p>
            </details>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
