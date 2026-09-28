"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslate } from "@refinedev/core";

import { GUEST_PROFILE_PATH } from "@/constants/guest-portal";
import { usePasswordPair } from "@/hooks/auth/use-password-pair.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPost } from "@/lib/client/api";
import { invitationApiPath, localizedInvitePath } from "@/lib/invitations/paths";
import { normalizeInviteToken } from "@/lib/invitations/token";
import { normalizeYfId } from "@/lib/people/yf-id";
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
  const [yfId, setYfId] = useState("");
  const [busy, setBusy] = useState(false);
  const passwords = usePasswordPair();
  const acceptedRef = useRef(false);

  const needsYfId = Boolean(payload?.needsYfId);
  const needsPassword = Boolean(payload?.needsPassword);
  const invitePath = localizedInvitePath(locale, token);
  const profilePath = path(GUEST_PROFILE_PATH);
  const yfIdValue = normalizeYfId(yfId);

  const applyResult = useCallback(
    (result: InvitePayload) => {
      const session = sessionFromInvite(result);
      if (session) {
        enterSession(session, profilePath);
        return;
      }
      setPayload(result);
      setMessage(translate("invite.accepted"));
    },
    [profilePath, translate]
  );

  const postAccept = useCallback(
    async (body: Record<string, string>) => {
      setBusy(true);
      try {
        applyResult(
          await apiPost<InvitePayload>(invitationApiPath(token), body)
        );
      } catch (error) {
        acceptedRef.current = false;
        setMessage(apiErrorMessage(error, translate("invite.failed")));
      } finally {
        setBusy(false);
      }
    },
    [applyResult, token, translate]
  );

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
      payload.needsYfId ||
      payload.needsPassword ||
      acceptedRef.current ||
      !getSession()?.token
    ) {
      return;
    }
    acceptedRef.current = true;
    void postAccept({});
  }, [payload, postAccept]);

  async function accept(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    if (needsYfId) {
      if (!yfIdValue) {
        setMessage(translate("invite.yfIdRequired"));
        return;
      }
    }
    if (needsPassword) {
      if (!passwords.matches) {
        setMessage(translate("auth.passwordsDontMatch"));
        return;
      }
    }
    const body: Record<string, string> = {};
    if (needsYfId) {
      body.yfId = yfIdValue;
    }
    if (needsPassword) {
      body.password = passwords.password;
      body.confirmPassword = passwords.confirmPassword;
    }
    await postAccept(body);
  }

  return {
    payload,
    message,
    busy,
    passwords,
    yfId,
    setYfId,
    needsYfId,
    needsPassword,
    invitePath,
    signedIn: Boolean(getSession()?.token),
    canSubmit:
      !busy &&
      (needsYfId ? Boolean(yfIdValue) : true) &&
      (needsPassword ? passwords.ready : true) &&
      (needsYfId || needsPassword),
    submit: accept,
  };
}
