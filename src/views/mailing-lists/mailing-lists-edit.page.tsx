"use client";

import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import {
  EditView,
  EditViewHeader,
} from "@/components/shared/refine-ui/views/edit-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function MailingListsEditPage() {
  const labels = useResourceLabels("mailingLists");
  return (
    <EditView>
      <EditViewHeader title={labels.titles.edit} />
      <MailingListForm mode="edit" />
    </EditView>
  );
}
