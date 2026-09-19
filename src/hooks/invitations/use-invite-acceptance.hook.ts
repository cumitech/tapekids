"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { usePasswordPair } from "@/hooks/auth/use-password-pair.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { invitationApiPath } from "@/lib/invitations/paths";
import { normalizeInviteToken } from "@/lib/invitations/token";
import {
  sessionFromInvite,
  type InvitePayload,
} from "@/models/invitations/invitation.model";
import { enterSession, getSession } from "@/utils/auth-storage";

export function useInviteAcceptance() {
  const params = useParams<{ token: string }>();
  const translate = useTranslate();
  const { path, locale } = useLocale();
  const token = normalizeInviteToken(String(params.token ?? ""));
  const [payload, setPayload] = useState<InvitePayload | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const passwords = usePasswordPair();
  const acceptedRef = useRef(false);

  const needsPassword = Boolean(payload?.needsPassword);
  const invitePath = `/${locale}/invite/${encodeURIComponent(token)}`;

  useEffect(() => {
    if (!token) {
      return;
    }
    apiGet<InvitePayload>(invitationApiPath(token))
      .then(setPayload)
      .catch((error) =>
        setMessage(apiErrorMessage(error, translate("invite.notFound")))
      );
  }, [token, translate]);

  useEffect(() => {
    if (
      !payload ||
      payload.needsPassword ||
      acceptedRef.current ||
      !getSession()?.token
    ) {
      return;
    }
    acceptedRef.current = true;
    setBusy(true);
    apiPost<InvitePayload>(invitationApiPath(token), {})
      .then((result) => {
        const session = sessionFromInvite(result);
        if (session) {
          enterSession(session, path("/dashboard"));
          return;
        }
        setPayload(result);
        setMessage(translate("invite.accepted"));
      })
      .catch((error) => {
        acceptedRef.current = false;
        setMessage(apiErrorMessage(error, translate("invite.failed")));
      })
      .finally(() => setBusy(false));
  }, [path, payload, token, translate]);

  async function accept(event: React.FormEvent) {
    event.preventDefault();
    if (!token || !payload?.needsPassword) {
      return;
    }
    if (!passwords.matches) {
      setMessage(translate("auth.passwordsDontMatch"));
      return;
    }
    setBusy(true);
    try {
      const result = await apiPost<InvitePayload>(invitationApiPath(token), {
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
      });
      const session = sessionFromInvite(result);
      if (session) {
        enterSession(session, path("/dashboard"));
        return;
      }
      setPayload(result);
      setMessage(translate("invite.accepted"));
    } catch (error) {
      setMessage(apiErrorMessage(error, translate("invite.failed")));
    } finally {
      setBusy(false);
    }
  }

  return {
    payload,
    message,
    busy,
    passwords,
    needsPassword,
    invitePath,
    signedIn: Boolean(getSession()?.token),
    canSubmit: !busy && passwords.ready,
    submit: accept,
  };
}
