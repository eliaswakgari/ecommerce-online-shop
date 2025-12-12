import { useMemo } from "react";
export default function usePagination(total, page, pageSize) {
  const pages = Math.ceil((total || 0) / pageSize);
  return useMemo(() => ({ pages, hasPrev: page > 1, hasNext: page < pages }), [pages, page]);
}
