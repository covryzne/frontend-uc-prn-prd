import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/shared/Pagination";
import { defaultSearchEngines, searchEngineOptions } from "@/data/mockData";
import type { KeywordItem } from "@/types";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fetchKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
} from "@/services/keywordService";
import {
  fetchWhitelistDomains,
  createWhitelistDomain,
  deleteWhitelistDomain,
} from "@/services/whitelistService";
import { useToast } from "@/hooks/use-toast";
import {
  getSchedules,
  type ScheduleItem,
  updateSchedule,
  stopSchedule as stopScheduleAPI,
} from "@/services/scheduleService";

export default function AdminConsole() {
  const { toast } = useToast();
  const [engines, setEngines] = useState(defaultSearchEngines);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [queueSummary, setQueueSummary] = useState<{
    pending: number;
    processing: number;
    done: number;
    failed: number;
  } | null>(null);
  const [kwPage, setKwPage] = useState(1);
  const [kwPerPage, setKwPerPage] = useState(10);
  const [kwModalOpen, setKwModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingKeywordText, setEditingKeywordText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingWhitelist, setIsLoadingWhitelist] = useState(false);
  const [isUpdatingWhitelist, setIsUpdatingWhitelist] = useState(false);

  // Fetch keywords on component mount
  useEffect(() => {
    loadKeywords();
    loadWhitelist();
  }, []);

  // schedules for admin console
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const loadSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Gagal memuat jadwal", variant: "destructive" });
    } finally {
      setSchedulesLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const managedSchedule =
    schedules.find((item) => (item.status || "").toLowerCase() === "running") ||
    (schedules.length > 0 ? schedules[0] : null);
  const isCrawling = Boolean(managedSchedule?.is_running);

  const [selectedIntervalLocal, setSelectedIntervalLocal] = useState<
    string | undefined
  >(undefined);
  const [pendingInterval, setPendingInterval] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (managedSchedule) {
      setSelectedIntervalLocal(managedSchedule.interval || "1h");
      const loadedEngines = (managedSchedule.crawl_engine || "google")
        .split(",")
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1));
      setEngines(loadedEngines.length > 0 ? loadedEngines : ["Google"]);
    }
  }, [managedSchedule]);

  const scheduleOptions = [
    { label: "Setiap 30 menit", value: "30m" },
    { label: "Setiap 1 jam", value: "1h" },
    { label: "Setiap 2 jam", value: "2h" },
    { label: "Setiap 4 jam", value: "4h" },
    { label: "Setiap 8 jam", value: "8h" },
    { label: "Setiap 10 jam", value: "10h" },
    { label: "Setiap 12 jam", value: "12h" },
  ];

  const onSelectChange = (val: string) => {
    if (!managedSchedule || val === selectedIntervalLocal) return;
    setPendingInterval(val);
    setConfirmOpen(true);
  };

  const onConfirmChange = async () => {
    if (!managedSchedule || !pendingInterval) return;
    if (engines.length === 0) {
      toast({
        title: "Search engine belum dipilih",
        description: "Pilih minimal satu search engine.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const crawlEngineValue = engines
        .map((engine) => engine.trim().toLowerCase())
        .filter(Boolean)
        .join(",");

      await updateSchedule(
        managedSchedule.id,
        pendingInterval,
        true,
        crawlEngineValue || "google",
      );
      await loadSchedules();
      setSelectedIntervalLocal(pendingInterval);
      setPendingInterval(null);
      toast({ title: "Schedule updated and started" });
    } catch (e) {
      console.error(e);
      toast({ title: "Gagal memperbarui schedule", variant: "destructive" });
    } finally {
      setUpdating(false);
      setConfirmOpen(false);
    }
  };

  const onStopSchedule = async () => {
    if (!managedSchedule) return;
    try {
      await stopScheduleAPI(managedSchedule.id);
      await loadSchedules();
      toast({ title: "Schedule stopped" });
    } catch (e) {
      console.error(e);
      toast({ title: "Gagal menghentikan schedule", variant: "destructive" });
    }
  };

  const loadKeywords = async () => {
    try {
      setIsLoadingKeywords(true);
      const response = await fetchKeywords(1, 100);
      if (response.success && response.data) {
        const formattedKeywords: KeywordItem[] = response.data.map(
          (k, index) => ({
            no: index + 1,
            keyword: k.keyword,
            id: k.id,
          }),
        );
        setKeywords(formattedKeywords);
        setQueueSummary(
          response.queue_summary ?? {
            pending: 0,
            processing: 0,
            done: 0,
            failed: 0,
          },
        );
      }
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
      toast({
        title: "Gagal memuat keyword",
        description:
          error instanceof Error
            ? error.message
            : "Tidak bisa mengambil data keyword dari server.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  const toggleEngine = (e: string) => {
    setEngines((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  };

  const normalizeWhitelistInput = (raw: string) => {
    let domain = raw.trim().toLowerCase();
    if (!domain) return "";
    domain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (domain.includes("/")) {
      domain = domain.split("/", 1)[0];
    }
    if (!domain.startsWith(".")) {
      domain = `.${domain}`;
    }
    return domain;
  };

  const loadWhitelist = async () => {
    try {
      setIsLoadingWhitelist(true);
      const domains = await fetchWhitelistDomains();
      setWhitelist(domains);
    } catch (error) {
      console.error("Failed to fetch whitelist:", error);
      setWhitelist([]);
      toast({
        title: "Gagal memuat whitelist",
        description: "Data whitelist tidak tersedia dari server.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWhitelist(false);
    }
  };

  const addWhitelistAsync = async () => {
    const normalized = normalizeWhitelistInput(newDomain);
    if (!normalized) return;
    if (whitelist.includes(normalized)) {
      toast({
        title: "Domain sudah ada",
        description: normalized,
      });
      return;
    }

    try {
      setIsUpdatingWhitelist(true);
      await createWhitelistDomain(normalized);
      await loadWhitelist();
      setNewDomain("");
      toast({
        title: "Whitelist diperbarui",
        description: `${normalized} ditambahkan ke database.`,
      });
    } catch (error) {
      console.error("Failed to add whitelist:", error);
      toast({
        title: "Gagal menambah whitelist",
        description:
          error instanceof Error
            ? error.message
            : "Domain whitelist tidak bisa disimpan.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingWhitelist(false);
    }
  };

  const removeWhitelistAsync = async (domain: string) => {
    try {
      setIsUpdatingWhitelist(true);
      await deleteWhitelistDomain(domain);
      await loadWhitelist();
      toast({
        title: "Whitelist diperbarui",
        description: `${domain} dihapus dari database.`,
      });
    } catch (error) {
      console.error("Failed to delete whitelist:", error);
      toast({
        title: "Gagal menghapus whitelist",
        description:
          error instanceof Error
            ? error.message
            : "Domain whitelist tidak bisa dihapus.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingWhitelist(false);
    }
  };

  const addKeyword = async () => {
    if (newKeyword.trim()) {
      try {
        await createKeyword(newKeyword.trim());
        // Optimistically update queue pending count so UI updates immediately
        setQueueSummary((q) =>
          q
            ? { ...q, pending: (q.pending ?? 0) + 1 }
            : { pending: 1, processing: 0, done: 0, failed: 0 },
        );
        await loadKeywords();
        setNewKeyword("");
        setKwModalOpen(false);
        toast({
          title: "Keyword berhasil ditambahkan",
          description: isCrawling
            ? "Keyword akan diantrikan untuk crawl berikutnya."
            : newKeyword.trim(),
        });
      } catch (error) {
        console.error("Failed to add keyword:", error);
        toast({
          title: "Gagal menambah keyword",
          description:
            error instanceof Error
              ? error.message
              : "Keyword tidak bisa disimpan.",
          variant: "destructive",
        });
      }
    }
  };

  const openEditModal = (keyword: KeywordItem) => {
    if (isCrawling) {
      toast({
        title: "Keyword sudah dalam proses crawl",
        description: "Tidak bisa diedit saat crawling sedang berjalan.",
        variant: "destructive",
      });
      return;
    }

    setEditingKeywordId(keyword.id || null);
    setEditingKeywordText(keyword.keyword);
    setEditModalOpen(true);
  };

  const saveEditKeyword = async () => {
    if (editingKeywordId && editingKeywordText.trim()) {
      try {
        await updateKeyword(editingKeywordId, editingKeywordText.trim());
        // Edited keywords are re-queued as pending on the backend; update UI immediately
        setQueueSummary((q) =>
          q
            ? { ...q, pending: (q.pending ?? 0) + 1 }
            : { pending: 1, processing: 0, done: 0, failed: 0 },
        );
        await loadKeywords();
        setEditModalOpen(false);
        setEditingKeywordId(null);
        setEditingKeywordText("");
        toast({
          title: "Keyword berhasil diperbarui",
          description: editingKeywordText.trim(),
        });
      } catch (error) {
        console.error("Failed to edit keyword:", error);
        toast({
          title: "Gagal mengedit keyword",
          description:
            error instanceof Error
              ? error.message
              : "Keyword tidak bisa diperbarui.",
          variant: "destructive",
        });
      }
    }
  };

  const openDeleteConfirm = (keywordId: string) => {
    setKeywordToDelete(keywordId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (keywordToDelete) {
      try {
        await deleteKeyword(keywordToDelete);
        await loadKeywords();
        setDeleteConfirmOpen(false);
        setKeywordToDelete(null);
        toast({
          title: "Keyword berhasil dihapus",
          description: "Data keyword sudah dihapus dari database.",
        });
      } catch (error) {
        console.error("Failed to delete keyword:", error);
        toast({
          title: "Gagal menghapus keyword",
          description:
            error instanceof Error
              ? error.message
              : "Keyword tidak bisa dihapus.",
          variant: "destructive",
        });
      }
    }
  };

  const paginatedKw = keywords.slice(
    (kwPage - 1) * kwPerPage,
    kwPage * kwPerPage,
  );

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Search Engines */}
      <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <Label className="text-sm font-semibold">Search Engine</Label>
          <div className="flex flex-col gap-1">
            {/* {queueSummary ? (
              <p className="text-sm text-muted-foreground">
                {queueSummary.processing > 0
                  ? `Processing ${queueSummary.processing} keyword${
                      queueSummary.processing === 1 ? "" : "s"
                    }...`
                  : `Queue: ${queueSummary.pending} item${
                      queueSummary.pending === 1 ? "" : "s"
                    }`}
              </p>
            ) : null} */}
            <div className="flex flex-wrap gap-2">
              {searchEngineOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleEngine(e)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    engines.includes(e)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 lg:pr-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Jadwal Crawl</Label>
                <p className="text-xs text-muted-foreground">
                  Pilih interval untuk memulai crawl otomatis.
                </p>
              </div>

              {schedulesLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading schedules...
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No scheduler configured. Please create a schedule in the
                  backend.
                </div>
              ) : (
                (() => {
                  const s = managedSchedule;
                  if (!s) return null;
                  const isRunning = s.status === "running";
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Status Crawl:
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            isRunning
                              ? "bg-green-100 text-green-800"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isRunning ? "Sedang berjalan" : "Berhenti"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Pilih jadwal crawl
                        </div>
                        <Select
                          value={selectedIntervalLocal}
                          onValueChange={onSelectChange}
                        >
                          <SelectTrigger className="w-full max-w-md">
                            <SelectValue placeholder="Pilih interval crawl" />
                          </SelectTrigger>
                          <SelectContent>
                            {scheduleOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {isRunning && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={onStopSchedule}
                        >
                          Stop Schedule
                        </Button>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            <div className="space-y-3 border-t pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Whitelist Domain
                </Label>
                <p className="text-xs text-muted-foreground">
                  Kelola domain aman yang otomatis dikategorikan Non-Pornografi.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isLoadingWhitelist ? (
                  <span className="text-xs text-muted-foreground">
                    Loading whitelist...
                  </span>
                ) : (
                  whitelist.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium"
                    >
                      {d}
                      <button
                        onClick={() => removeWhitelistAsync(d)}
                        className="hover:text-destructive disabled:opacity-50"
                        disabled={isUpdatingWhitelist}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah Domain Whitelist"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="max-w-md"
                  onKeyDown={(e) => e.key === "Enter" && addWhitelistAsync()}
                  disabled={isUpdatingWhitelist}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWhitelistAsync}
                  disabled={isUpdatingWhitelist}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingInterval(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Jadwal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>
              Yakin mau set jadwal crawl ke <strong>{pendingInterval}</strong>{" "}
              dan mulai scheduler?
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingInterval(null);
                }}
                disabled={updating}
              >
                Batal
              </Button>
              <Button onClick={onConfirmChange} disabled={updating}>
                {updating ? "Updating..." : "Ya, mulai"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keywords */}
      <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              Daftar Keyword ({keywords.length.toLocaleString("id-ID")})
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="mr-1">
                Queue {queueSummary?.pending ?? 0}
              </Badge>
              <Button size="sm" onClick={() => setKwModalOpen(true)}>
                Add Keyword
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="p-3 font-medium text-muted-foreground w-16">
                    No
                  </th>
                  <th className="p-3 font-medium text-muted-foreground">
                    Keyword
                  </th>
                  <th className="p-3 font-medium text-muted-foreground w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingKeywords ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Loading keywords...
                    </td>
                  </tr>
                ) : paginatedKw.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-center text-muted-foreground"
                    >
                      No keywords found
                    </td>
                  </tr>
                ) : (
                  paginatedKw.map((k) => (
                    <tr
                      key={k.id || k.no}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 text-xs text-muted-foreground">
                        {k.no}
                      </td>
                      <td className="p-3 text-sm">{k.keyword}</td>
                      <td className="p-3 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditModal(k)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => openDeleteConfirm(k.id || "")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            total={keywords.length}
            page={kwPage}
            perPage={kwPerPage}
            onPageChange={setKwPage}
            onPerPageChange={setKwPerPage}
            perPageOptions={[10, 20, 50]}
          />
        </CardContent>
      </Card>

      {/* Add Keyword Modal */}
      <Dialog open={kwModalOpen} onOpenChange={setKwModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Keyword</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Masukkan keyword baru"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              autoFocus
            />
            <Button className="w-full" onClick={addKeyword}>
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Keyword Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Keyword</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Edit keyword"
              value={editingKeywordText}
              onChange={(e) => setEditingKeywordText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEditKeyword()}
              autoFocus
              disabled={isCrawling}
            />
            <Button
              className="w-full"
              onClick={saveEditKeyword}
              disabled={isCrawling}
            >
              Perbarui
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Keyword?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus keyword ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isCrawling}
              >
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
