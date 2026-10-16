"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { AuditChangesCell } from "@/components/audit-logs/audit-changes-cell";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/models/audit-logs/audit-log.model";

export function useAuditLogsListPage() {
  const { locale } = useLocale();
  const labels = useResourceLabels("auditLogs", [
    "action",
    "entity",
    "actor",
    "createdAt",
    "changes",
  ]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: labels.fields.createdAt,
        cell: ({ row }) => formatDateTime(row.original.createdAt, locale) || "-",
      },
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
      {
        id: "changes",
        header: labels.fields.changes,
        cell: ({ row }) => <AuditChangesCell record={row.original} />,
      },
    ],
    [labels, locale]
  );

  return useCachedTable<AuditLog>({
    resource: "audit-logs",
    columns,
  });
}
