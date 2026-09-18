"use client";

import { PersonForm } from "@/components/people/person-form.component";
import {
  CreateView,
  CreateViewHeader,
} from "@/components/shared/refine-ui/views/create-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function PeopleCreatePage() {
  const labels = useResourceLabels("people");
  return (
    <CreateView>
      <CreateViewHeader title={labels.titles.create} />
      <PersonForm mode="create" />
    </CreateView>
  );
}
