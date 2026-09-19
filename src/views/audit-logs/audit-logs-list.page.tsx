"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslate } from "@refinedev/core";

import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { AuditLog } from "@/models/audit-logs/audit-log.model";

function AuditChangesCell({ record }: { record: AuditLog }) {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
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
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {translate("auditLogs.viewChanges")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{translate("auditLogs.viewChanges")}</DialogTitle>
          </DialogHeader>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(changes, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AuditLogsListPage() {
  const labels = useResourceLabels("auditLogs", [
    "action",
    "entity",
    "actor",
    "createdAt",
    "changes",
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
      {
        id: "changes",
        header: labels.fields.changes,
        cell: ({ row }) => <AuditChangesCell record={row.original} />,
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
