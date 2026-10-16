"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { formatDateTime } from "@/lib/format";
import { normalizeYfId } from "@/lib/people/yf-id";
import type { AuthSession } from "@/utils/auth-storage";
import { enterSession } from "@/utils/auth-storage";

export type JoinEvent = {
  eventId: string;
  title: string;
  city: string;
  venue: string;
  startsAt: string;
  endsAt?: string | null;
};

type EnterResult =
  | { found: false; event: JoinEvent }
  | (AuthSession & { found: true });

export function useEventJoinPage() {
  const params = useParams<{ token: string }>();
  const token = String(params.token ?? "");
  const translate = useTranslate();
  const { path, locale } = useLocale();
  const [event, setEvent] = useState<JoinEvent | null>(null);
  const [yfId, setYfId] = useState("");
  const [phase, setPhase] = useState<"loading" | "ask" | "register" | "missing">(
    "loading"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setPhase("missing");
      return;
    }
    apiGet<JoinEvent>(`/public/join/${encodeURIComponent(token)}`)
      .then((result) => {
        setEvent(result);
        setPhase("ask");
      })
      .catch(() => setPhase("missing"));
  }, [token]);

  async function onSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const value = normalizeYfId(yfId);
    if (!value) {
      setError(translate("invite.yfIdRequired"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await apiPost<EnterResult>(
        `/public/join/${encodeURIComponent(token)}`,
        { yfId: value }
      );
      if (result.found) {
        enterSession(
          { token: result.token, user: result.user },
          path("/dashboard")
        );
        return;
      }
      setYfId(value);
      setEvent(result.event);
      setPhase("register");
    } catch (cause) {
      setError(apiErrorMessage(cause, translate("events.joinPublic.failed")));
    } finally {
      setBusy(false);
    }
  }

  const when = event ? formatDateTime(event.startsAt, locale) : "";
  const place = event ? [event.venue, event.city].filter(Boolean).join(", ") : "";

  return {
    translate,
    event,
    yfId,
    setYfId,
    phase,
    busy,
    error,
    when,
    place,
    onSubmit,
    backToAsk: () => {
      setError("");
      setPhase("ask");
    },
  };
}
