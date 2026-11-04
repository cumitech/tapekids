"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslate } from "@refinedev/core";

import {
  INVITATION_AUDIENCES,
  membershipKindForInvitation,
  type InvitationAudience,
} from "@/constants/event-participation";
import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { hasTranslatedField } from "@/lib/content-i18n/pick";
import {
  invitationDeliveryNotice,
  type InvitationDeliveryResult,
} from "@/lib/invitations/delivery-notice";
import { invitationDrafts } from "@/lib/invitations/invitation-copy";
import type { Event } from "@/models/events/event.model";
import type { InvitationReadiness } from "@/models/people/people-import.model";

export function useInvitationQueue(
  mailingListId: string,
  options?: {
    eventId?: string;
    prepareOnly?: boolean;
    onSent?: (result: InvitationDeliveryResult) => void;
  }
) {
  const translate = useTranslate();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const onSentRef = useRef(options?.onSent);
  onSentRef.current = options?.onSent;
  const prepareOnly = options?.prepareOnly ?? false;
  const [eventId, setEventId] = useState(options?.eventId ?? "");
  const [event, setEvent] = useState<Event | null>(null);
  const [audience, setAudience] = useState<InvitationAudience>(
    INVITATION_AUDIENCES.CAMPER
  );
  const [previewLocale, setPreviewLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const [subject, setSubject] = useState({ fr: "", en: "" });
  const [body, setBody] = useState({ fr: "", en: "" });
  const [readiness, setReadiness] = useState<InvitationReadiness | null>(null);
  const actionLabel = prepareOnly
    ? translate("mailingLists.prepareInvitations")
    : integrations.mailEnabled
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
      setSubject({ fr: "", en: "" });
      setBody({ fr: "", en: "" });
      return;
    }
    const draft = invitationDrafts(event, audience);
    setSubject(draft.subject);
    setBody(draft.body);
  }, [event, audience]);

  const translations = {
    fr: { subject: subject.fr, body: body.fr },
    en: { subject: subject.en, body: body.en },
  };
  const canSend =
    !busy &&
    Boolean(eventId) &&
    hasTranslatedField(translations, "subject") &&
    hasTranslatedField(translations, "body");

  function chooseEvent(nextEventId: string) {
    setEventId(nextEventId);
    setReadiness(null);
  }

  function reviewRecipients() {
    return run(async () => {
      const result = await apiPost<InvitationReadiness>(
        `/events/${eventId}/invitation-readiness`,
        { mailingListId }
      );
      setReadiness(result);
    }, translate("mailingLists.readinessFailed"));
  }

  function send() {
    if (!readiness || readiness.readyCount === 0) {
      return Promise.resolve(false);
    }
    let succeeded = false;
    return run(async () => {
      const payload = await apiPost<InvitationDeliveryResult>(
        `/events/${eventId}/invitation-batches`,
        {
          mailingListId,
          selectedPersonIds: readiness.readyPersonIds,
          ...(prepareOnly ? { draftOnly: true } : {}),
          kind: membershipKindForInvitation(audience),
          translations,
        }
      );
      notify?.(
        invitationDeliveryNotice(
          payload,
          integrations.mailEnabled,
          translate
        )
      );
      onSentRef.current?.(payload);
      succeeded = true;
    }, translate("mailingLists.invitationsSendFailed")).then(() => succeeded);
  }

  return {
    actionLabel,
    eventId,
    setEventId: chooseEvent,
    event,
    audience,
    setAudience,
    previewLocale,
    setPreviewLocale,
    subject,
    setSubject,
    body,
    setBody,
    busy,
    canSend,
    readiness,
    reviewRecipients,
    send,
  };
}
