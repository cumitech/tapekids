"use client";

import { useMemo } from "react";
import type { CrudFilter, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { BaseRecord } from "@refinedev/core";

import { TABLE_DEFAULTS } from "@/constants/table-defaults";

type UseCachedTableParams<TData extends BaseRecord> = {
  resource: string;
  columns: ColumnDef<TData, unknown>[];
  permanentFilters?: CrudFilter[];
  search?: boolean;
};

const searchColumn: ColumnDef<BaseRecord, unknown> = {
  id: "q",
  accessorFn: () => "",
  enableHiding: true,
  enableColumnFilter: true,
  meta: {
    filterOperator: "contains",
  },
};

export function useCachedTable<TData extends BaseRecord>({
  resource,
  columns,
  permanentFilters,
  search = true,
}: UseCachedTableParams<TData>) {
  const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(
    () => (search ? [searchColumn as ColumnDef<TData, unknown>, ...columns] : columns),
    [columns, search]
  );

  const table = useTable<TData, HttpError>({
    columns: tableColumns,
    refineCoreProps: {
      resource,
      syncWithLocation: true,
      pagination: {
        pageSize: TABLE_DEFAULTS.pageSize,
      },
      queryOptions: {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      filters: permanentFilters
        ? {
            permanent: permanentFilters,
          }
        : undefined,
    },
  });

  const records = useMemo(() => {
    const query = table.refineCore.tableQuery as {
      result?: { data?: TData[] };
      data?: { data?: TData[] };
    };

    return query.result?.data ?? query.data?.data ?? [];
  }, [table.refineCore.tableQuery]);

  return { table, records };
}
