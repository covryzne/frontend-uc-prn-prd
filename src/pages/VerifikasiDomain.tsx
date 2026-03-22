import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import { mockDomains, mockDomainDetail } from "@/data/mockData";
import type { DomainStatus, DomainItem } from "@/types";
import { Download, ListChecks, Eye, ImageIcon } from "lucide-react";

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

  const filtered = mockDomains.filter((d) => {
    if (search && !d.domain.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "Semua" && d.status !== statusFilter) return false;
    return true;
  });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((d) => d.id)));
  };

  const openDetail = (d: DomainItem) => {
    setSelectedDomain(d);
    setVerifyStatus(d.status);
    setUserReasoning("");
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Cari domain..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Semua", "Pornografi", "Non-Pornografi", "Manual Check"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm font-medium">Daftar Domain ({total.toLocaleString("id-ID")})</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}>
            <ListChecks className="h-4 w-4 mr-1" />{bulkMode ? "Batal" : "Bulk Action"}
          </Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" />Export Pornografi</Button>
        </div>
      </div>

      {bulkMode && selectedIds.size > 0 && (
        <Card><CardContent className="p-3 flex items-center gap-3">
          <span className="text-sm">{selectedIds.size} dipilih —</span>
          {(["Pornografi", "Non-Pornografi", "Manual Check"] as DomainStatus[]).map((s) => (
            <Button key={s} variant="outline" size="sm" className="text-xs">{s}</Button>
          ))}
        </CardContent></Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  {bulkMode && <th className="p-3"><Checkbox checked={selectedIds.size === paginated.length && paginated.length > 0} onCheckedChange={toggleAll} /></th>}
                  <th className="p-3 font-medium text-muted-foreground">Timestamp</th>
                  <th className="p-3 font-medium text-muted-foreground">Domain</th>
                  <th className="p-3 font-medium text-muted-foreground">Status</th>
                  <th className="p-3 font-medium text-muted-foreground">Score</th>
                  <th className="p-3 font-medium text-muted-foreground">Screenshot</th>
                  <th className="p-3 font-medium text-muted-foreground">Verifikator</th>
                  <th className="p-3 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    {bulkMode && <td className="p-3"><Checkbox checked={selectedIds.has(d.id)} onCheckedChange={() => toggleSelect(d.id)} /></td>}
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(d.timestamp).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}, {d.timestamp.slice(11, 16)}</td>
                    <td className="p-3 font-mono text-xs max-w-[200px] truncate">{d.domain}</td>
                    <td className="p-3"><StatusBadge status={d.status} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Progress value={d.score} className="w-16 h-1.5" />
                        <span className="text-xs tabular-nums">{d.score}%</span>
                      </div>
                    </td>
                    <td className="p-3"><div className="h-8 w-12 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div></td>
                    <td className="p-3 text-xs">{d.verifikator ?? <span className="text-muted-foreground italic">—</span>}</td>
                    <td className="p-3"><Button variant="ghost" size="sm" className="text-xs" onClick={() => openDetail(d)}><Eye className="h-3.5 w-3.5 mr-1" />Detail</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination total={total} page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-base">{selectedDomain?.domain}</span>
              <StatusBadge status={selectedDomain?.status ?? "Manual Check"} />
            </DialogTitle>
            <p className="text-xs text-muted-foreground truncate">{mockDomainDetail.url}</p>
          </DialogHeader>

          <div className="space-y-5">
            {/* AI Analysis */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Analisis AI</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status AI</Label>
                  <div className="mt-1"><StatusBadge status={mockDomainDetail.status} /></div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Confidence Score</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={mockDomainDetail.confidence_score} className="flex-1 h-2" />
                    <span className="text-sm font-semibold tabular-nums">{mockDomainDetail.confidence_score}%</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">AI Reasoning</Label>
                <p className="mt-1 text-sm bg-muted/50 rounded-md p-3">{mockDomainDetail.ai_reasoning}</p>
              </div>
            </div>

            {/* User Verification */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Verifikasi Manual</h4>
              <div>
                <Label htmlFor="reason" className="text-xs">Reasoning Anda</Label>
                <Textarea id="reason" placeholder="Masukkan reasoning Anda..." value={userReasoning} onChange={(e) => setUserReasoning(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Ubah Status</Label>
                <Select value={verifyStatus} onValueChange={(v) => setVerifyStatus(v as DomainStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Pornografi", "Non-Pornografi", "Manual Check"] as DomainStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => setDetailOpen(false)}>Simpan Verifikasi</Button>
            </div>

            {/* Additional info */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">Informasi Tambahan</h4>
              <div className="flex flex-wrap gap-1.5">
                {mockDomainDetail.kata_kunci.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{k}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Waktu Crawl:</span> {new Date(mockDomainDetail.crawled_at).toLocaleString("id-ID")}</div>
                <div><span className="text-muted-foreground">ViT Score:</span> {mockDomainDetail.vit_score}%</div>
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="text-sm font-semibold">{mockDomainDetail.total_url_in_domain} URL dalam domain ini</h4>
              <div className="grid grid-cols-2 gap-3">
                {mockDomainDetail.screenshots.map((s, i) => (
                  <div key={i} className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground mt-1">{s.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted content */}
            <details className="border-t pt-4">
              <summary className="text-sm font-semibold cursor-pointer">Konten Terekstrak</summary>
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3 font-mono-code text-xs">{mockDomainDetail.konten_terekstrak}</p>
            </details>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
