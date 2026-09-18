"use client";

import type { BaseKey } from "@refinedev/core";

import { useResourceForm } from "@/hooks/core/use-resource-form.hook";
import {
  emptyPersonForm,
  personFormToPayload,
  personToFormValues,
  type Person,
} from "@/models/people/person.model";
import type { PersonFormValues } from "@/types/forms";

type UsePersonFormParams = {
  mode: "create" | "edit";
  id?: BaseKey;
  resource?: string;
  record?: Person | null;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function usePersonForm({
  mode,
  id,
  resource = "people",
  record,
  onCancel,
  onSuccess,
}: UsePersonFormParams) {
  return useResourceForm<
    Person,
    PersonFormValues,
    ReturnType<typeof personFormToPayload>
  >({
    resource,
    mode,
    id,
    emptyValues: emptyPersonForm,
    initialRecord: record,
    toFormValues: personToFormValues,
    toPayload: personFormToPayload,
    refetchOnMount: true,
    onCancel,
    onSuccess,
  });
}
