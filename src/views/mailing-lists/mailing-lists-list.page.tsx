"use client";

import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import {
  MAILING_LIST_MODAL,
  useMailingListsListPage,
} from "@/hooks/mailing-lists/use-mailing-lists-list.hook";

export function MailingListsListPage() {
  const { table, openCreate } = useMailingListsListPage();

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
