"use client";

import { useCallback, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { Upload } from "lucide-react";

import { PeopleImportDialog } from "@/components/people/people-import-dialog";
import { PersonForm } from "@/components/people/person-form.component";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { usePeopleDirectoryColumns } from "@/hooks/people/use-people-directory-columns.hook";
import { clearListQueryCache } from "@/lib/client/list-query-cache";
import type { Person } from "@/models/people/person.model";

export function PeopleListPage() {
  const translate = useTranslate();
  const { openEdit } = useDashboardFormModal();
  const [importOpen, setImportOpen] = useState(false);
  const renderActions = useCallback(
    (row: Person) => (
      <ResourceRowActions
        id={row.id}
        onEdit={() =>
          openEdit("people", row.id, ({ close }) => (
            <PersonForm
              mode="edit"
              id={row.id}
              onCancel={close}
              onSuccess={close}
            />
          ))
        }
      />
    ),
    [openEdit]
  );
  const columns = usePeopleDirectoryColumns<Person>({
    renderActions,
  });

  const { table } = useCachedTable<Person>({
    resource: "people",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader canCreate={false}>
        <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {translate("people.import.action")}
        </Button>
      </ListViewHeader>
      <DataTable table={table} />
      <PeopleImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => {
          clearListQueryCache("people");
          void table.refineCore.tableQuery.refetch();
        }}
      />
    </ListView>
  );
}
