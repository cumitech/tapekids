"use client";

import { useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

import {
  EVENT_MEMBERSHIP_KINDS,
  type EventMembershipKind,
} from "@/constants/event-participation";
import type { AppLocale } from "@/constants/locales";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { apiGet, apiPost } from "@/lib/client/api";
import { isEmptyHtml } from "@/lib/html";
import {
  invitationDeliveryNotice,
  type InvitationDeliveryResult,
} from "@/lib/invitations/delivery-notice";
import { invitationDrafts } from "@/lib/invitations/invitation-copy";
import type { Event } from "@/models/events/event.model";

export function useInvitationQueue(mailingListId: string) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const [eventId, setEventId] = useState("");
  const [event, setEvent] = useState<Event | null>(null);
  const [kind, setKind] = useState<EventMembershipKind>(
    EVENT_MEMBERSHIP_KINDS.CAMPER
  );
  const [previewLocale, setPreviewLocale] = useState<AppLocale>(locale);
  const [subject, setSubject] = useState({ en: "", fr: "" });
  const [body, setBody] = useState({ en: "", fr: "" });
  const actionLabel = integrations.mailEnabled
    ? translate("mailingLists.sendInvitations")
    : translate("mailingLists.queueInvitations");

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    let cancelled = false;
    apiGet<Event>(`/events/${eventId}`)
      .then((record) => {
        if (!cancelled) {
          setEvent(record);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvent(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!event) {
      setSubject({ en: "", fr: "" });
      setBody({ en: "", fr: "" });
      return;
    }
    const draft = invitationDrafts(event, kind);
    setSubject(draft.subject);
    setBody(draft.body);
  }, [event, kind]);

  const canSend =
    !busy && Boolean(eventId) && Boolean(subject.en) && !isEmptyHtml(body.en);

  function send() {
    return run(async () => {
      const payload = await apiPost<InvitationDeliveryResult>(
        `/events/${eventId}/invitation-batches`,
        {
          mailingListId,
          kind,
          translations: {
            en: { subject: subject.en, body: body.en },
            fr: { subject: subject.fr, body: body.fr },
          },
        }
      );
      notify?.(
        invitationDeliveryNotice(
          payload,
          integrations.mailEnabled,
          translate
        )
      );
    }, translate("mailingLists.invitationsSendFailed"));
  }

  return {
    actionLabel,
    eventId,
    setEventId,
    event,
    kind,
    setKind,
    previewLocale,
    setPreviewLocale,
    subject,
    setSubject,
    body,
    setBody,
    busy,
    canSend,
    send,
  };
}
