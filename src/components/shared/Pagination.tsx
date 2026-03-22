import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (p: number) => void;
  perPageOptions?: number[];
}

export function Pagination({ total, page, perPage, onPageChange, onPerPageChange, perPageOptions = [5, 10, 20, 50] }: Props) {
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground">
        Menampilkan {start} - {end} dari {total.toLocaleString("id-ID")}
      </p>
      <div className="flex items-center gap-2">
        <Select value={String(perPage)} onValueChange={(v) => { onPerPageChange(Number(v)); onPageChange(1); }}>
          <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{perPageOptions.map((o) => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={i} className="px-1 text-muted-foreground">...</span>
          ) : (
            <Button key={i} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => onPageChange(p)}>
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
