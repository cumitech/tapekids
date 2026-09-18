"use client";

import { useMemo } from "react";
import { useTranslate } from "@refinedev/core";
import type { ColumnDef } from "@tanstack/react-table";

import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { ResourceRowActions } from "@/components/shared/refine-ui/buttons/resource-row-actions";
import { columnFilter } from "@/components/shared/refine-ui/data-table/data-table-column-filter";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";
import { useCachedTable } from "@/hooks/core/use-cached-table.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import type { MailingList } from "@/models/mailing-lists/mailing-list.model";

const MAILING_LIST_MODAL = "sm:max-w-3xl";

export function MailingListsListPage() {
  const translate = useTranslate();
  const { openCreate, openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("mailingLists", ["name", "audienceKind"]);

  const audienceOptions = useMemo(
    () =>
      Object.values(MAILING_LIST_AUDIENCE_KINDS).map((value) => ({
        value,
        label: translate(`mailingLists.audienceKinds.${value}`),
      })),
    [translate]
  );

  const columns = useMemo<ColumnDef<MailingList>[]>(
    () => [
      { id: "name", accessorKey: "name", header: labels.fields.name },
      {
        id: "audienceKind",
        accessorKey: "audienceKind",
        header: labels.fields.audienceKind,
        ...columnFilter("select", audienceOptions),
      },
      {
        id: "actions",
        header: labels.tableActions,
        cell: ({ row }) => (
          <ResourceRowActions
            id={row.original.id}
            onEdit={() =>
              openEdit(
                "mailingLists",
                row.original.id,
                ({ close }) => (
                  <MailingListForm
                    mode="edit"
                    id={row.original.id}
                    onCancel={close}
                    onSuccess={close}
                  />
                ),
                MAILING_LIST_MODAL
              )
            }
          />
        ),
      },
    ],
    [audienceOptions, labels, openEdit]
  );

  const { table } = useCachedTable<MailingList>({
    resource: "mailing-lists",
    columns,
  });

  return (
    <ListView>
      <ListViewHeader
        onCreate={() =>
          openCreate(
            "mailingLists",
            ({ close }) => (
              <MailingListForm mode="create" onCancel={close} onSuccess={close} />
            ),
            MAILING_LIST_MODAL
          )
        }
      />
      <DataTable table={table} />
    </ListView>
  );
}
