"use client";

import type { BaseKey } from "@refinedev/core";

import { useResourceForm } from "@/hooks/core/use-resource-form.hook";
import {
  emptyMailingListForm,
  mailingListFormToPayload,
  mailingListToFormValues,
  type MailingList,
} from "@/models/mailing-lists/mailing-list.model";
import type { MailingListFormValues } from "@/types/forms";

type UseMailingListFormParams = {
  mode: "create" | "edit";
  id?: BaseKey;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function useMailingListForm({
  mode,
  id,
  onCancel,
  onSuccess,
}: UseMailingListFormParams) {
  return useResourceForm<
    MailingList,
    MailingListFormValues,
    ReturnType<typeof mailingListFormToPayload>
  >({
    resource: "mailing-lists",
    mode,
    id,
    emptyValues: emptyMailingListForm,
    toFormValues: mailingListToFormValues,
    toPayload: mailingListFormToPayload,
    onCancel,
    onSuccess,
  });
}
