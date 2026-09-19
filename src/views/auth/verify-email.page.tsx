"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useNotification, useTranslate } from "@refinedev/core";

import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiPost } from "@/lib/client/api";
import { enterSession, type AuthSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";

export function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const translate = useTranslate();
  const { path } = useLocale();
  const { open } = useNotification();
  const [busy, setBusy] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !params.token) {
      return;
    }
    started.current = true;
    void (async () => {
      try {
        const session = await apiPost<AuthSession>("/auth/verify-email", {
          token: params.token,
        });
        enterSession(session, path("/dashboard"));
      } catch (error) {
        open?.({
          type: "error",
          message: apiErrorMessage(error, translate("auth.verifyFailed")),
        });
        setBusy(false);
      }
    })();
  }, [open, params.token, path, translate]);

  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">
          {translate("auth.verifyEmail")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {busy
            ? translate("auth.verifying")
            : translate("auth.verifyFailed")}
        </p>
      </div>
    </PublicShell>
  );
}
