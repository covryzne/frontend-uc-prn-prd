import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
// Progress component removed: UI no longer displays score
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
  ExternalLink,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { authService } from "@/services/authService";

export default function VerifikasiDomain() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<
    "" | "verified" | "unverified"
  >("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatusFilter, setDraftStatusFilter] = useState("Semua");
  const [draftVerificationStatusFilter, setDraftVerificationStatusFilter] =
    useState<"" | "verified" | "unverified">("");
  const [draftDateFrom, setDraftDateFrom] = useState("");
  const [draftDateTo, setDraftDateTo] = useState("");
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
  const [detailRefreshTick, setDetailRefreshTick] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<DomainStatus>("Pornografi");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportTimeFrom, setExportTimeFrom] = useState("");
  const [exportTimeTo, setExportTimeTo] = useState("");
  const [exportStatuses, setExportStatuses] = useState({
    judol: true,
    non_judol: true,
    manual_check: true,
  });
  const [exportVerificationStatus, setExportVerificationStatus] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const defaultExportColumns = [
    "timestamp_crawled",
    "status",
    "verifikator",
    "verified_at",
    "urls",
    "final_score",
    "user_reasoning",
    "extracted_text",
    "screenshot_paths",
  ] as const;
  const exportColumnLabels: Record<string, string> = {
    timestamp_crawled: "Timestamp Crawled",
    status: "Status",
    verifikator: "Verifikator",
    verified_at: "Verified At",
    urls: "URLs",
    final_score: "Final Score",
    user_reasoning: "User Reasoning",
    extracted_text: "Extracted Text",
    screenshot_paths: "Screenshot Paths",
  };
  const [exportColumns, setExportColumns] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultExportColumns.map((c) => [c, true])),
  );
  const [isExportingJudol, setIsExportingJudol] = useState(false);
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
  const uniqueDetailUrlCount = detailPages.length;
  type SortField = "timestamp" | "domain" | "vit_score";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? "▲" : "▼";
  };
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [total, setTotal] = useState(0);

  const openFilterDialog = () => {
    setDraftStatusFilter(statusFilter);
    setDraftVerificationStatusFilter(verificationStatusFilter);
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(draftStatusFilter);
    setVerificationStatusFilter(draftVerificationStatusFilter);
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setPage(1);
    setFilterOpen(false);
  };

  const resetFilterDraft = () => {
    setDraftStatusFilter("Semua");
    setDraftVerificationStatusFilter("");
    setDraftDateFrom("");
    setDraftDateTo("");
  };

  const activeFilterCount = [
    statusFilter !== "Semua",
    Boolean(verificationStatusFilter),
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

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
    if (selectedPage) {
      setVerifyStatus(selectedPage.status);
    }
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
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const handleBulkVerify = async () => {
    if (!selectedIds.size) return;
    setIsBulkVerifying(true);
    const selectedDomains = domains.filter((d) => selectedIds.has(d.id));
    if (!selectedDomains.length) {
      setIsBulkVerifying(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        selectedDomains.map((d) =>
          updateDomainStatus(d.id, {
            status: mapDomainStatusToApi(bulkStatus),
          }),
        ),
      );

      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        setLoadError(`${failedCount} domain gagal diverifikasi`);
      }

      /*
      const response = await runBulkInference({
        domain_ids: selectedDomains.map((d) => d.id),
        run_ocr: true,
      });

      console.log("Bulk inference result:", response);
      */
      setSelectedIds(new Set());
      setBulkMode(false);
      setRefreshTick((prev) => prev + 1);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Bulk verifikasi gagal dijalankan",
      );
    } finally {
      setIsBulkVerifying(false);
    }
  };

  const allStatusesSelected =
    exportStatuses.judol &&
    exportStatuses.non_judol &&
    exportStatuses.manual_check;

  const toggleAllExportStatuses = (checked: boolean) => {
    setExportStatuses({
      judol: checked,
      non_judol: checked,
      manual_check: checked,
    });
  };

  const toggleSingleExportStatus = (
    key: keyof typeof exportStatuses,
    checked: boolean,
  ) => {
    setExportStatuses((prev) => ({ ...prev, [key]: checked }));
  };

  const toggleExportColumn = (key: string, checked: boolean) => {
    setExportColumns((prev) => ({ ...prev, [key]: checked }));
  };

  const openExportDialog = () => {
    setIsExportDialogOpen(true);
  };

  const handleExportJudol = async () => {
    setIsExportingJudol(true);
    try {
      // Build statuses param mapping
      const statusMap: Record<string, string> = {
        judol: "porno",
        non_judol: "non_porno",
        manual_check: "manual_check",
      };
      const selectedStatuses = Object.entries(exportStatuses)
        .filter(([, v]) => v)
        .map(([k]) => statusMap[k] as string)
        .join(",");

      const selectedColumns = Object.entries(exportColumns)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(",");

      const params: Record<string, string> = {};
      if (selectedStatuses) params.statuses = selectedStatuses;
      if (exportVerificationStatus && exportVerificationStatus !== "all")
        params.verification_status = exportVerificationStatus;
      if (exportTimeFrom) params.time_from = exportTimeFrom;
      if (exportTimeTo) params.time_to = exportTimeTo;
      if (selectedColumns) params.columns = selectedColumns;

      const url = buildExportUrl(params as any);

      const token = authService.getAccessToken();
      const res = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "Failed to export");
        throw new Error(txt || "Failed to export");
      }

      const blob = await res.blob();
      const filename = `export-porno-${new Date().toISOString()}.csv`;
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Export failed", error);
      alert(error instanceof Error ? error.message : "Export gagal");
    } finally {
      setIsExportingJudol(false);
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
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    const normalized = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Number(normalized.toFixed(1))));
  };

  const buildDetailFromApi = (payload: {
    domain_id: string;
    domain_name: string;
    reasoning_verificator?: string | null;
    crawls: Array<{
      crawl_id: string;
      keyword: string | null;
      confidence_score: number | null;
      reasoning: string | null;
      inner_text: string | null;
      latest: {
        crawl: {
          timestamp: string | null;
          url: string | null;
          status_code: number | null;
        };
        scraped: {
          thumbnail: string | null;
          screenshot_path: string | null;
        } | null;
        inference: {
          vit_score: number | null;
          status: "porno" | "non_porno" | "manual_check" | null;
          overlay_image: string | null;
        } | null;
      };
    }>;
  }): DomainDetail => {
    const pages: DomainDetailPage[] = payload.crawls.map((crawl) => ({
      url: crawl.latest.crawl.url ?? "",
      status: mapApiStatusToDomainStatus(crawl.latest.inference?.status),
      statusCode: crawl.latest.crawl.status_code ?? null,
      confidence_score: normalizeScore(crawl.confidence_score) ?? 0,
      ai_reasoning: crawl.reasoning ?? "-",
      user_reasoning: payload.reasoning_verificator ?? "",
      kata_kunci: crawl.keyword ? [crawl.keyword] : [],
      crawled_at: crawl.latest.crawl.timestamp ?? new Date().toISOString(),
      vit_score: normalizeScore(crawl.latest.inference?.vit_score),
      screenshots: (crawl.latest.inference?.overlay_image ||
        crawl.latest.scraped?.screenshot_path)
        ? [
            {
              url:
                crawl.latest.inference?.overlay_image ??
                crawl.latest.scraped?.screenshot_path ??
                "",
              caption: "Crawl screenshot",
            },
          ]
        : [],
      konten_terekstrak: crawl.inner_text ?? "-",
      latest: crawl.latest,
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
      vit_score: firstPage?.vit_score ?? null,
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

    const timeFromISO = dateFrom
      ? new Date(`${dateFrom}T00:00:00Z`).toISOString()
      : undefined;
    const timeToISO = dateTo
      ? new Date(`${dateTo}T23:59:59Z`).toISOString()
      : undefined;

    fetchDomains({
      search: search || undefined,
      status: apiStatus,
      verification_status: verificationStatusFilter || undefined,
      time_from: timeFromISO,
      time_to: timeToISO,
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
          timestamp: item.latest.crawl.timestamp ?? new Date().toISOString(),
          status: mapApiStatusToDomainStatus(item.latest.inference?.status),
          score: normalizeScore(item.latest.inference?.vit_score),
          vitScore: normalizeScore(item.latest.inference?.vit_score),
          screenshot: item.latest.scraped?.thumbnail ?? null,
          verifikator: item.verifiedBy ?? null,
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
    verificationStatusFilter,
    dateFrom,
    dateTo,
    page,
    perPage,
    sortField,
    sortDirection,
    refreshTick,
  ]);

  useEffect(() => {
    if (!selectedDomain || !detailOpen) return;
    let active = true;
    setDetailLoading(true);
    setDetailError(null);

    fetchDomainDetail(selectedDomain.id)
      .then((response) => {
        if (!active) return;
        const mapped = buildDetailFromApi(response);
        setDomainDetail(mapped);
        setVerifyStatus(mapped.grouped_pages?.[0]?.status ?? mapped.status);
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
  }, [selectedDomain, detailOpen, detailRefreshTick]);

  const handleSaveStatus = async () => {
    if (!selectedDomain) return;
    setIsSaving(true);
    try {
      await updateDomainStatus(selectedDomain.id, {
        status: mapDomainStatusToApi(verifyStatus),
        reasoning_verificator: userReasoning || undefined,
      });
      setDetailRefreshTick((prev) => prev + 1);
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
      {/* Search & Filter Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          placeholder="Cari domain..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:flex-1"
        />
        <Popover
          open={filterOpen}
          onOpenChange={(open) => {
            setFilterOpen(open);
            if (open) {
              setDraftStatusFilter(statusFilter);
              setDraftVerificationStatusFilter(verificationStatusFilter);
              setDraftDateFrom(dateFrom);
              setDraftDateTo(dateTo);
            }
          }}
        >
          <div className="relative inline-flex sm:ml-auto">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={openFilterDialog}
                className="gap-2 sm:w-auto"
              >
                <Calendar className="h-4 w-4" />
                Apply Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-sidebar-primary px-2 py-0.5 text-[11px] font-semibold text-sidebar-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" side="bottom" className="w-[420px]">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status Domain
                  </label>
                  <Select
                    value={draftStatusFilter}
                    onValueChange={(v) => setDraftStatusFilter(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Semua",
                        "Pornografi",
                        "Non-Pornografi",
                        "Manual Check",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Status Verifikasi
                  </label>
                  <Select
                    value={draftVerificationStatusFilter || "all"}
                    onValueChange={(v: any) =>
                      setDraftVerificationStatusFilter(
                        v === "all" ? "" : (v as "verified" | "unverified"),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="verified">
                        Sudah Diverifikasi
                      </SelectItem>
                      <SelectItem value="unverified">
                        Belum Diverifikasi
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Dari Tanggal
                    </label>
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={draftDateFrom}
                        onChange={(e) => setDraftDateFrom(e.target.value)}
                        className="flex-1 border-0 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Sampai Tanggal
                    </label>
                    <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={draftDateTo}
                        onChange={(e) => setDraftDateTo(e.target.value)}
                        className="flex-1 border-0 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetFilterDraft();
                    }}
                  >
                    Reset Filter
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </div>
        </Popover>
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
            onClick={openExportDialog}
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
            <Select
              value={bulkStatus}
              onValueChange={(value) => setBulkStatus(value as DomainStatus)}
            >
              <SelectTrigger className="h-8 text-xs sm:w-[180px]">
                <SelectValue placeholder="Pilih status" />
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
            <Button
              size="sm"
              className="text-xs"
              onClick={handleBulkVerify}
              disabled={isBulkVerifying}
            >
              {isBulkVerifying ? "Memverifikasi..." : "Verifikasi Terpilih"}
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
                    onClick={() => handleSort("vit_score")}
                  >
                    <span>VIT Score</span>
                    <span className="ml-1 text-xs">
                      {renderSortIndicator("vit_score")}
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
                          timeZone: "Asia/Jakarta",
                        })}
                        , {new Date(d.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Jakarta",
                        })}
                      </td>
                      <td className="p-3 font-mono text-xs max-w-[200px] truncate">
                        {d.domain}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="p-3 text-xs font-medium">
                        {typeof d.vitScore === "number"
                          ? `${d.vitScore.toFixed(1)}%`
                          : "—"}
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

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent id="export-judol-dialog" className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filter Export CSV</DialogTitle>
            <DialogDescription>
              Atur filter export untuk mengurangi beban server. Kolom domain
              akan selalu ikut diexport.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Time Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="export-time-from-input"
                    className="text-xs text-muted-foreground"
                  >
                    From
                  </Label>
                  <Input
                    id="export-time-from-input"
                    type="datetime-local"
                    value={exportTimeFrom}
                    onChange={(e) => setExportTimeFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="export-time-to-input"
                    className="text-xs text-muted-foreground"
                  >
                    To
                  </Label>
                  <Input
                    id="export-time-to-input"
                    type="datetime-local"
                    value={exportTimeTo}
                    onChange={(e) => setExportTimeTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status Domain</Label>
                <div className="space-y-2 border rounded-md p-3">
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor="export-status-all"
                  >
                    <Checkbox
                      id="export-status-all"
                      className="rounded-full"
                      checked={allStatusesSelected}
                      onCheckedChange={(checked) =>
                        toggleAllExportStatuses(checked === true)
                      }
                    />
                    <span>Semua Status</span>
                  </label>
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor="export-status-judol"
                  >
                    <Checkbox
                      id="export-status-judol"
                      className="rounded-full"
                      checked={exportStatuses.judol}
                      onCheckedChange={(checked) =>
                        toggleSingleExportStatus("judol", checked === true)
                      }
                    />
                    <span>Judi Online</span>
                  </label>
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor="export-status-non-judol"
                  >
                    <Checkbox
                      id="export-status-non-judol"
                      className="rounded-full"
                      checked={exportStatuses.non_judol}
                      onCheckedChange={(checked) =>
                        toggleSingleExportStatus("non_judol", checked === true)
                      }
                    />
                    <span>Non Judi Online</span>
                  </label>
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor="export-status-manual-check"
                  >
                    <Checkbox
                      id="export-status-manual-check"
                      className="rounded-full"
                      checked={exportStatuses.manual_check}
                      onCheckedChange={(checked) =>
                        toggleSingleExportStatus(
                          "manual_check",
                          checked === true,
                        )
                      }
                    />
                    <span>Manual Check</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status Verifikasi</Label>
                <Select
                  value={exportVerificationStatus}
                  onValueChange={(value: "all" | "verified" | "unverified") =>
                    setExportVerificationStatus(value)
                  }
                >
                  <SelectTrigger id="export-verification-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="verified">Sudah Diverifikasi</SelectItem>
                    <SelectItem value="unverified">
                      Belum Diverifikasi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Kolom Dalam File Export
                </Label>
                <span className="text-xs text-muted-foreground">
                  Domain wajib ada
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-3">
                {defaultExportColumns.map((columnKey) => (
                  <label
                    key={columnKey}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor={`export-column-${columnKey}`}
                  >
                    <Checkbox
                      id={`export-column-${columnKey}`}
                      className="rounded-full"
                      checked={exportColumns[columnKey]}
                      onCheckedChange={(checked) =>
                        toggleExportColumn(columnKey, checked === true)
                      }
                    />
                    <span>{exportColumnLabels[columnKey] ?? columnKey}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              id="export-judol-cancel-button"
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              disabled={isExportingJudol}
            >
              Batal
            </Button>
            <Button
              id="export-judol-confirm-button"
              onClick={handleExportJudol}
              disabled={isExportingJudol}
            >
              {isExportingJudol ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                "Export CSV"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
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
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedDetailUrl}
                    onValueChange={setDetailByUrl}
                  >
                    <SelectTrigger className="h-8 text-xs min-w-0">
                      <SelectValue placeholder="Pilih URL" />
                    </SelectTrigger>

                    <SelectContent>
                      {detailPages.map((page) => (
                        <SelectItem key={page.url} value={page.url}>
                          <span
                            className="block max-w-[360px] truncate"
                            title={page.url}
                          >
                            {page.url}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    if (selectedDetailUrl) {
                      window.open(
                        selectedDetailUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                  }}
                  disabled={!selectedDetailUrl}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
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

            {/* Confidence/score removed from modal - only classification shown */}

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
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Waktu Crawl:</span>{" "}
                  {detailData?.crawled_at
                    ? new Date(detailData.crawled_at).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                      })
                    : "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">VIT Score:</span>{" "}
                  {typeof detailData?.vit_score === "number"
                    ? `${detailData.vit_score.toFixed(1)}%`
                    : "-"}
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">
                {uniqueDetailUrlCount} URL dalam domain ini
              </h4>
              <div className="relative rounded-lg bg-muted aspect-video overflow-hidden border max-w-full">
                {activeScreenshot ? (
                  <img
                    src={activeScreenshot.url}
                    alt={activeScreenshot.caption}
                    className="h-full w-full max-w-full object-contain"
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
