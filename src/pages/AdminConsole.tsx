import { useState } from "react";
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
  mockKeywords,
} from "@/data/mockData";
import type { KeywordItem } from "@/types";
import { X, Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminConsole() {
  const [engines, setEngines] = useState(defaultSearchEngines);
  const [whitelist, setWhitelist] = useState(defaultWhitelist);
  const [newDomain, setNewDomain] = useState("");
  const [schedule, setSchedule] = useState("Setiap 30 menit");
  const [keywords, setKeywords] = useState<KeywordItem[]>(mockKeywords);
  const [kwPage, setKwPage] = useState(1);
  const [kwPerPage, setKwPerPage] = useState(10);
  const [kwModalOpen, setKwModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

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

  const addKeyword = () => {
    if (newKeyword) {
      setKeywords((prev) => [
        ...prev,
        { no: prev.length + 1, keyword: newKeyword },
      ]);
      setNewKeyword("");
      setKwModalOpen(false);
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
      <Card className="w-full sm:flex-1">
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
      </Card>

      {/* Keywords */}
      <Card className="w-full sm:flex-1">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">
              Daftar Keyword ({keywords.length.toLocaleString("id-ID")})
            </Label>
            <Button size="sm" onClick={() => setKwModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Keyword
            </Button>
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
                {paginatedKw.map((k) => (
                  <tr
                    key={k.no}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 text-xs text-muted-foreground">
                      {k.no}
                    </td>
                    <td className="p-3 text-sm">{k.keyword}</td>
                    <td className="p-3 flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() =>
                          setKeywords((prev) =>
                            prev.filter((x) => x.no !== k.no),
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
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
            />
            <Button className="w-full" onClick={addKeyword}>
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
