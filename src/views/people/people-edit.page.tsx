"use client";

import { PersonForm } from "@/components/people/person-form.component";
import {
  EditView,
  EditViewHeader,
} from "@/components/shared/refine-ui/views/edit-view";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";

export function PeopleEditPage() {
  const labels = useResourceLabels("people");
  return (
    <EditView>
      <EditViewHeader title={labels.titles.edit} />
      <PersonForm mode="edit" />
    </EditView>
  );
}
