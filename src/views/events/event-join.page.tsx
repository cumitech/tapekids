"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@/components/shared/ui/separator";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { formatDateTime } from "@/lib/format";
import { normalizeYfId } from "@/lib/people/yf-id";
import type { AuthSession } from "@/utils/auth-storage";
import { enterSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";
import { WaitingListJoinForm } from "@/views/waiting-list/waiting-list-join.page";

type JoinEvent = {
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

export function EventJoinPage() {
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

  if (phase === "register" && event) {
    return (
      <PublicShell>
        <WaitingListJoinForm
          embedded
          event={{ id: event.eventId, title: event.title }}
          initialYfId={yfId}
          onChangeYfId={() => {
            setError("");
            setPhase("ask");
          }}
        />
      </PublicShell>
    );
  }

  const when = event ? formatDateTime(event.startsAt, locale) : "";
  const place = event ? [event.venue, event.city].filter(Boolean).join(", ") : "";

  return (
    <PublicShell>
      <AuthFormFrame className="max-w-xl">
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary">
            {event?.title || translate("events.titles.show")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {phase === "missing"
              ? translate("events.joinPublic.missing")
              : translate("events.joinPublic.prompt")}
          </CardDescription>
        </CardHeader>
        <Separator />
        {phase === "loading" ? (
          <p className="text-sm">{translate("events.join.loading")}</p>
        ) : null}
        {phase === "ask" ? (
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            {when || place ? (
              <p className="text-sm text-muted-foreground">
                {[when, place].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="join-yf-id">{translate("invite.yfId")}</Label>
              <Input
                id="join-yf-id"
                value={yfId}
                autoComplete="off"
                placeholder={translate("invite.yfIdPlaceholder")}
                onChange={(input) => setYfId(input.target.value)}
              />
              {/* <p className="text-sm text-muted-foreground">
                {translate("invite.yfIdHint")}
              </p> */}
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={busy}>
              {busy
                ? translate("events.joinPublic.checking")
                : translate("events.joinPublic.continue")}
            </Button>
          </form>
        ) : null}
      </AuthFormFrame>
    </PublicShell>
  );
}
