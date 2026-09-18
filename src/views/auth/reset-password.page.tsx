"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useNotification, useTranslate } from "@refinedev/core";

import { PasswordConfirmFields } from "@/components/shared/form/password-confirm-fields";
import { Button } from "@/components/shared/ui/button";
import { usePasswordPair } from "@/hooks/auth/use-password-pair.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiPost } from "@/lib/client/api";
import { enterSession, type AuthSession } from "@/utils/auth-storage";
import { PublicShell } from "@/views/auth/public-shell";

export function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const translate = useTranslate();
  const { path } = useLocale();
  const { open } = useNotification();
  const passwords = usePasswordPair();
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!passwords.matches) {
      open?.({
        type: "error",
        message: translate("auth.passwordsDontMatch"),
      });
      return;
    }
    setBusy(true);
    try {
      const session = await apiPost<AuthSession>("/auth/reset-password", {
        token: params.token,
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
      });
      enterSession(session, path("/dashboard"));
    } catch (error) {
      open?.({
        type: "error",
        message: apiErrorMessage(error, translate("auth.resetFailed")),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PublicShell>
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-4 p-8"
        onSubmit={(event) => void submit(event)}
      >
        <h1 className="text-2xl font-semibold">
          {translate("auth.resetPassword")}
        </h1>
        <PasswordConfirmFields
          idPrefix="reset"
          password={passwords.password}
          confirmPassword={passwords.confirmPassword}
          onPasswordChange={passwords.setPassword}
          onConfirmChange={passwords.setConfirmPassword}
        />
        <Button type="submit" disabled={busy || !passwords.ready}>
          {translate("auth.savePassword")}
        </Button>
      </form>
    </PublicShell>
  );
}
