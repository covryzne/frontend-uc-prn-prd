import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Props {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (p: number) => void;
  perPageOptions?: number[];
}

export function Pagination({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 50],
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  const visiblePages: number[] = [];
  const pageWindow = Math.min(totalPages, 5);

  for (let i = 0; i < pageWindow; i += 1) {
    let pageNumber: number;
    if (totalPages <= 5) {
      pageNumber = i + 1;
    } else if (currentPage <= 3) {
      pageNumber = i + 1;
    } else if (currentPage >= totalPages - 2) {
      pageNumber = totalPages - 4 + i;
    } else {
      pageNumber = currentPage - 2 + i;
    }
    visiblePages.push(pageNumber);
  }

  return (
    <div className="space-y-3 pt-4">
      {/* Row 2: Controls & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Left: Per halaman & Pergi ke halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Per halaman:
            </span>
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                onPerPageChange(Number(v));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((o) => (
                  <SelectItem key={o} value={String(o)}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Pergi ke halaman:
            </span>
            <Select
              value={String(currentPage)}
              onValueChange={(value) => onPageChange(Number(value))}
            >
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <SelectItem key={pageNumber} value={pageNumber.toString()}>
                      {pageNumber}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: Navigation Buttons */}
        <div className="flex items-center gap-2 flex-nowrap md:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || total === 0}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || total === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {visiblePages.map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className="w-8 h-8 p-0"
                disabled={total === 0}
              >
                {pageNumber}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || total === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || total === 0}
          >
            Last
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Menampilkan {start} - {end} dari {total.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
