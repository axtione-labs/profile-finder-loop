import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  setPage: (p: number) => void;
}

export const TablePagination = ({ page, totalPages, total, from, to, setPage }: Props) => {
  if (total <= 0) return null;
  return (
    <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5 text-xs text-muted-foreground">
      <span>{from}–{to} sur {total}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="sm"
              className={`h-7 w-7 p-0 text-xs ${p === page ? "gradient-primary text-white" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          );
        })}
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
