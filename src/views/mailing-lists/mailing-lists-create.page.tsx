"use client";

import { MailingListForm } from "@/components/mailing-lists/mailing-list-form.component";
import {
  CreateView,
  CreateViewHeader,
} from "@/components/shared/refine-ui/views/create-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function MailingListsCreatePage() {
  const labels = useResourceLabels("mailingLists");
  return (
    <CreateView>
      <CreateViewHeader title={labels.titles.create} />
      <MailingListForm mode="create" />
    </CreateView>
  );
}
