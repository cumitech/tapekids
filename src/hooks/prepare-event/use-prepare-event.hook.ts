"use client";

import { useCallback, useMemo, useState } from "react";
import { useList, useTranslate } from "@refinedev/core";
import { useRouter, useSearchParams } from "next/navigation";

import { EVENT_TYPES, isEventType } from "@/constants/event-type";
import { PERSON_CATEGORIES } from "@/constants/person";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { invitationDeliveryNotice } from "@/lib/invitations/delivery-notice";
import { sendInvitationBatch } from "@/lib/invitations/send-batch";
import {
  parsePrepareEventSearch,
  prepareEventPath,
  type PrepareEventState,
} from "@/lib/prepare-event/state";
import type { PeopleImportResult } from "@/models/people/people-import.model";
import type { Event } from "@/models/events/event.model";
import type { MailingList } from "@/models/mailing-lists/mailing-list.model";

export function usePrepareEvent() {
  const router = useRouter();
  const params = useSearchParams();
  const { path } = useLocale();
  const state = useMemo(() => parsePrepareEventSearch(params), [params]);

  const go = useCallback(
    (patch: Partial<PrepareEventState>) => {
      const next = prepareEventPath({ ...state, ...patch });
      if (next === prepareEventPath(state)) {
        return;
      }
      router.replace(path(next), { scroll: false });
    },
    [path, router, state]
  );

  return { state, go };
}

function directoryTotal(query: {
  data?: { total?: number };
  result?: { total?: number };
}) {
  return query.result?.total ?? query.data?.total ?? 0;
}

export function usePrepareImportStep() {
  const [imported, setImported] = useState(false);
  const { query } = useList({
    resource: "people",
    pagination: { currentPage: 1, pageSize: 1 },
    queryOptions: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
  const hasPeople = directoryTotal(query) > 0;

  return {
    canContinue: !query.isLoading && (hasPeople || imported),
    markImported: (result: PeopleImportResult) => {
      if (result.created + result.updated + result.unchanged > 0) {
        setImported(true);
      }
    },
  };
}

export function mailingListDefaults(state: PrepareEventState) {
  if (state.listId) {
    return undefined;
  }
  return {
    audienceKind:
      state.eventType === EVENT_TYPES.DAY_EVENT
        ? PERSON_CATEGORIES.TROPHY_PARTICIPANT
        : PERSON_CATEGORIES.TROPHY_CAMPER,
  };
}

export function eventSavedPatch(
  state: PrepareEventState,
  record: Event
): Partial<PrepareEventState> {
  return {
    step: "list",
    eventId: record.id,
    eventType: isEventType(record.eventType)
      ? record.eventType
      : state.eventType,
  };
}

export function listSavedPatch(record: MailingList): Partial<PrepareEventState> | null {
  if (!record.id) {
    return null;
  }
  return { step: "send", listId: record.id };
}

export function usePrepareSendStep(state: PrepareEventState) {
  const translate = useTranslate();
  const { path } = useLocale();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();

  return {
    busy,
    eventHref: path(`/dashboard/events/show/${state.eventId}`),
    listHref: path(`/dashboard/mailing-lists/show/${state.listId}`),
    resend: () =>
      run(async () => {
        const payload = await sendInvitationBatch(state.batchId);
        notify?.(
          invitationDeliveryNotice(
            payload,
            integrations.mailEnabled,
            translate
          )
        );
      }, translate("mailingLists.invitationsSendFailed")),
  };
}
