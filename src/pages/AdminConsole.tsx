import { useState, useEffect, useRef } from "react";
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
import {
  defaultWhitelist,
  defaultSearchEngines,
  searchEngineOptions,
  crawlScheduleOptions,
} from "@/data/mockData";
import type { KeywordItem } from "@/types";
import { X, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  startCrawl as startCrawlAPI,
  cancelCrawl as cancelCrawlAPI,
} from "@/services/crawlService";
import {
  fetchKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
} from "@/services/keywordService";
import { useToast } from "@/hooks/use-toast";

export default function AdminConsole() {
  const { toast } = useToast();
  const crawlingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [engines, setEngines] = useState(defaultSearchEngines);
  const [whitelist, setWhitelist] = useState(defaultWhitelist);
  const [newDomain, setNewDomain] = useState("");
  const [schedule, setSchedule] = useState("Setiap 30 menit");
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [kwPage, setKwPage] = useState(1);
  const [kwPerPage, setKwPerPage] = useState(10);
  const [kwModalOpen, setKwModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editingKeywordText, setEditingKeywordText] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);
  const [isCrawling, setIsCrawling] = useState(
    localStorage.getItem("is_crawling") === "true",
  );
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);

  // Fetch keywords on component mount
  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    return () => {
      if (crawlingTimeoutRef.current) {
        clearTimeout(crawlingTimeoutRef.current);
      }
    };
  }, []);

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

  const addWhitelist = () => {
    if (newDomain && !whitelist.includes(newDomain)) {
      setWhitelist([...whitelist, newDomain]);
      setNewDomain("");
    }
  };

  const clearCrawlingState = () => {
    if (crawlingTimeoutRef.current) {
      clearTimeout(crawlingTimeoutRef.current);
      crawlingTimeoutRef.current = null;
    }

    localStorage.removeItem("is_crawling");
    setIsCrawling(false);
  };

  const addKeyword = async () => {
    if (isCrawling) {
      toast({
        title: "Crawling sedang berjalan",
        description: "Keyword baru akan berlaku untuk crawl berikutnya.",
        variant: "destructive",
      });
      return;
    }

    if (newKeyword.trim()) {
      try {
        await createKeyword(newKeyword.trim());
        await loadKeywords();
        setNewKeyword("");
        setKwModalOpen(false);
        toast({
          title: "Keyword berhasil ditambahkan",
          description: newKeyword.trim(),
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
        title: "Crawling sedang berjalan",
        description: "Edit keyword akan berlaku untuk crawl berikutnya.",
        variant: "destructive",
      });
      return;
    }

    setEditingKeywordId(keyword.id || null);
    setEditingKeywordText(keyword.keyword);
    setEditModalOpen(true);
  };

  const saveEditKeyword = async () => {
    if (isCrawling) {
      toast({
        title: "Crawling sedang berjalan",
        description: "Perubahan keyword akan berlaku untuk crawl berikutnya.",
        variant: "destructive",
      });
      return;
    }

    if (editingKeywordId && editingKeywordText.trim()) {
      try {
        await updateKeyword(editingKeywordId, editingKeywordText.trim());
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
    if (isCrawling) {
      toast({
        title: "Crawling sedang berjalan",
        description: "Hapus keyword akan berlaku untuk crawl berikutnya.",
        variant: "destructive",
      });
      return;
    }

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

  const startCrawl = async () => {
    if (keywords.length === 0) {
      toast({
        title: "Keyword belum ada",
        description: "Tambahkan minimal satu keyword sebelum memulai crawling.",
        variant: "destructive",
      });
      return;
    }

    if (engines.length === 0) {
      toast({
        title: "Search engine belum dipilih",
        description: "Pilih minimal satu search engine sebelum crawling.",
        variant: "destructive",
      });
      return;
    }

    try {
      setKwModalOpen(false);
      setEditModalOpen(false);
      setDeleteConfirmOpen(false);

      const crawlEngine = engines[0].toLowerCase();
      const keywordStrings = keywords.map((k) => k.keyword);
      const tldWhitelistStr = whitelist.join(";");

      await startCrawlAPI({
        keywords: keywordStrings,
        crawl_engine: crawlEngine,
        ai_reasoning: true,
        tld_whitelist: tldWhitelistStr,
      });

      // Set persistent crawling state in localStorage
      localStorage.setItem("is_crawling", "true");
      setIsCrawling(true);

      // Auto-reset after 60 seconds (optional indicator)
      if (crawlingTimeoutRef.current) {
        clearTimeout(crawlingTimeoutRef.current);
      }

      crawlingTimeoutRef.current = setTimeout(() => {
        clearCrawlingState();
      }, 60000);

      toast({
        title: "Crawling dimulai",
        description: "Keyword sudah dikirim ke backend untuk diproses.",
      });
    } catch (error) {
      console.error("Crawl error:", error);
      toast({
        title: "Gagal memulai crawling",
        description:
          error instanceof Error
            ? error.message
            : "Request crawling gagal dijalankan.",
        variant: "destructive",
      });
      // Don't reset state on error - let user see the error persists
    }
  };

  const cancelCrawling = async () => {
    try {
      await cancelCrawlAPI();
      clearCrawlingState();
      toast({
        title: "Crawling dibatalkan",
        description: "Backend sudah menerima request cancel.",
      });
    } catch (error) {
      console.error("Cancel crawl error:", error);
      toast({
        title: "Gagal membatalkan crawling",
        description:
          error instanceof Error
            ? error.message
            : "Request cancel tidak berhasil dijalankan.",
        variant: "destructive",
      });
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
        </CardContent>
      </Card>

      {/* Whitelist */}
      <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <Label className="text-sm font-semibold">Whitelist Domain</Label>
          <p className="text-xs text-muted-foreground">
            Domain yang masuk whitelist akan otomatis dikategorikan
            Non-Pornografi
          </p>
          <div className="flex flex-wrap gap-2">
            {whitelist.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium"
              >
                {d}
                <button
                  onClick={() =>
                    setWhitelist((prev) => prev.filter((x) => x !== d))
                  }
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Tambah Domain Whitelist"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="max-w-xs"
              onKeyDown={(e) => e.key === "Enter" && addWhitelist()}
            />
            <Button variant="outline" size="sm" onClick={addWhitelist}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crawl Schedule */}
      {/* <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <Label className="text-sm font-semibold">Jadwal Crawl Otomatis</Label>
          <Select value={schedule} onValueChange={setSchedule}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {crawlScheduleOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Keyword akan di-crawl secara otomatis sesuai jadwal yang dipilih
          </p>
        </CardContent>
      </Card> */}

      {/* Keywords */}
      <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              Daftar Keyword ({keywords.length.toLocaleString("id-ID")})
            </Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setKwModalOpen(true)}
                disabled={isCrawling}
              >
                Add Keyword
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={startCrawl}
                disabled={isCrawling}
              >
                {isCrawling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memulai Crawling...
                  </>
                ) : (
                  "Start Crawl"
                )}
              </Button>
              {isCrawling && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={cancelCrawling}
                >
                  Cancel Crawling
                </Button>
              )}
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
                          disabled={isCrawling}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => openDeleteConfirm(k.id || "")}
                          disabled={isCrawling}
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
              disabled={isCrawling}
            />
            <Button
              className="w-full"
              onClick={addKeyword}
              disabled={isCrawling}
            >
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
