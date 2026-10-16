"use client";

import { useState } from "react";
import { useShow, useTranslate } from "@refinedev/core";

import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { categoryForAudience } from "@/constants/person";
import { apiDelete } from "@/lib/client/api";
import type { MailingList } from "@/models/mailing-lists/mailing-list.model";

export function memberIsInvited(person?: {
  hasInvitation?: boolean;
  invitations?: unknown[];
}) {
  if (!person) {
    return false;
  }
  return Boolean(
    person.hasInvitation ||
      (person.invitations && person.invitations.length > 0)
  );
}

export function useMailingListsShowPage() {
  const translate = useTranslate();
  const { locale } = useLocale();
  const { openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("mailingLists", ["name", "audienceKind"]);
  const { query } = useShow<MailingList>({ resource: "mailing-lists" });
  const record = query.data?.data;
  const { busy, run } = useBusyAction();
  const members = record?.members ?? [];
  const [focusBatchId, setFocusBatchId] = useState<string | null>(null);
  const audienceCategory = record
    ? categoryForAudience(record.audienceKind)
    : null;
  const audienceLabel = audienceCategory
    ? translate(`people.categories.${audienceCategory}`)
    : record?.audienceKind;

  function removeMember(personId: string) {
    if (!record) {
      return Promise.resolve();
    }
    return run(async () => {
      await apiDelete(`/mailing-lists/${record.id}/members/${personId}`);
      await query.refetch();
    }, translate("mailingLists.memberRemoveFailed"));
  }

  return {
    translate,
    locale,
    labels,
    record,
    members,
    busy,
    focusBatchId,
    audienceLabel,
    openEdit,
    refetch: () => void query.refetch(),
    setFocusBatchId,
    removeMember,
  };
}
