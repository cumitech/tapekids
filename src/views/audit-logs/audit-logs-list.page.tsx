"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { AuditLog } from "@/models/audit-logs/audit-log.model";

export function AuditLogsListPage() {
  const labels = useResourceLabels("auditLogs", [
    "action",
    "entity",
    "actor",
    "createdAt",
  ]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      { id: "createdAt", accessorKey: "createdAt", header: labels.fields.createdAt },
      {
        id: "action",
        accessorKey: "action",
        header: labels.fields.action,
        ...columnFilter(),
      },
      {
        id: "entity",
        accessorKey: "entity",
        header: labels.fields.entity,
        ...columnFilter(),
      },
      {
        id: "actor",
        header: labels.fields.actor,
        cell: ({ row }) =>
          row.original.actor?.email || row.original.actor?.username || "-",
      },
    ],
    [labels]
  );

  const { table } = useCachedTable<AuditLog>({
    resource: "audit-logs",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader />
      <DataTable table={table} />
    </ListView>
  );
}
