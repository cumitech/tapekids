"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PORTAL_SURFACE } from "@/constants/layout";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { cn } from "@/lib/utils";

export function EventJoinLink({ eventId }: { eventId: string }) {
  const translate = useTranslate();
  const { path } = useLocale();
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const result = await apiGet<{ token: string | null }>(
      `/events/${eventId}/join-link`
    );
    setToken(result.token);
    setLoaded(true);
  }, [eventId]);

  useEffect(() => {
    setOrigin(window.location.origin);
    void load().catch((cause) => {
      setError(apiErrorMessage(cause, translate("events.join.failed")));
      setLoaded(true);
    });
  }, [load, translate]);

  const url = token && origin ? `${origin}${path(`/join/${token}`)}` : "";

  async function generate(regenerate: boolean) {
    if (
      regenerate &&
      !window.confirm(translate("events.join.regenerateConfirm"))
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const result = await apiPost<{ token: string }>(
        `/events/${eventId}/join-link`,
        { regenerate }
      );
      setToken(result.token);
    } catch (cause) {
      setError(apiErrorMessage(cause, translate("events.join.failed")));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(translate("events.join.failed"));
    }
  }

  return (
    <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
      <h3 className="text-lg font-semibold">{translate("events.join.title")}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        {translate("events.join.description")}
      </p>
      {!loaded ? (
        <p className="mt-4 text-sm">{translate("events.join.loading")}</p>
      ) : url ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input readOnly value={url} aria-label={translate("events.join.title")} />
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={() => void copy()}>
              {copied
                ? translate("events.join.copied")
                : translate("events.join.copy")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void generate(true)}
            >
              {translate("events.join.regenerate")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-3">
          <p className="text-sm">{translate("events.join.empty")}</p>
          <Button type="button" disabled={busy} onClick={() => void generate(false)}>
            {translate("events.join.generate")}
          </Button>
        </div>
      )}
      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
