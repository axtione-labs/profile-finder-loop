import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], perPage = 20) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safeP = Math.min(page, totalPages);

  const paginated = useMemo(
    () => items.slice((safeP - 1) * perPage, safeP * perPage),
    [items, safeP, perPage],
  );

  return {
    page: safeP,
    setPage,
    totalPages,
    paginated,
    total: items.length,
    from: items.length === 0 ? 0 : (safeP - 1) * perPage + 1,
    to: Math.min(safeP * perPage, items.length),
  };
}
