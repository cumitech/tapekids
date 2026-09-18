"use client";

import { useList } from "@refinedev/core";

export function useResourceTotal(resource: string) {
  const { query } = useList({
    resource,
    pagination: { currentPage: 1, pageSize: 1 },
    queryOptions: { staleTime: 30_000 },
  });
  return query.data?.total ?? 0;
}
