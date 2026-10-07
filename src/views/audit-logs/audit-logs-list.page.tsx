"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";

import { useAppModal } from "@/components/shared/modals/app-modal";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatDateTime, formatPresentedValue } from "@/lib/format";
import type { AuditLog } from "@/models/audit-logs/audit-log.model";

function AuditChangesCell({ record }: { record: AuditLog }) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const { openModal } = useAppModal();
  const changes = record.changes;
  const hasChanges = Boolean(
    changes && typeof changes === "object" && Object.keys(changes).length > 0
  );

  if (!hasChanges) {
    return (
      <span className="text-sm text-muted-foreground">
        {translate("auditLogs.noChanges")}
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() =>
        openModal({
          title: translate("auditLogs.viewChanges"),
          className: "sm:max-w-2xl",
          body: (
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(formatPresentedValue(changes, locale), null, 2)}
            </pre>
          ),
        })
      }
    >
      {translate("auditLogs.viewChanges")}
    </Button>
  );
}

export function AuditLogsListPage() {
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
