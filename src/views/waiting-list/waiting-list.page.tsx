"use client";

import { DataTable } from "@/components/shared/refine-ui/data-table/data-table";
import {
  ListView,
  ListViewHeader,
} from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { useWaitingListPage } from "@/hooks/waiting-list/use-waiting-list.hook";

export function WaitingListPage() {
  const page = useWaitingListPage();

  return (
    <ListView>
      <ListViewHeader resource="waiting-list" canCreate={false}>
        <Button
          type="button"
          disabled={page.busy || page.selectedCount === 0}
          onClick={page.approveSelected}
        >
          {page.busy
            ? page.translate("waitingList.approving")
            : page.translate("waitingList.approveSelected", {
                count: page.selectedCount,
              })}
        </Button>
      </ListViewHeader>
      <DataTable table={page.table} />
    </ListView>
  );
}
