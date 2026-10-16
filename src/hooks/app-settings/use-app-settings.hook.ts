"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

import { APP_SETTING_KEYS } from "@/constants/app-settings";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { apiErrorMessage, apiGet, apiPatch } from "@/lib/client/api";
import { formatDateTime } from "@/lib/format";

export type SettingRow = {
  key: string;
  type: "boolean" | "text";
  value: string;
};

export type BatchRow = {
  id: string;
  subject: string;
  kind: string;
  status: string;
  linksOpen: boolean;
  eventTitle: string;
};

export type InvitationRow = {
  id: string;
  status: string;
  email: string;
  personName: string;
  eventTitle: string;
  batchSubject: string;
  batchLinksOpen: boolean;
  invitationOpen: boolean;
  expiresAt: string | null;
};

type SettingsPage = {
  settings: SettingRow[];
  batches: BatchRow[];
  invitations: InvitationRow[];
};

export function isBooleanOpen(value: string) {
  return value === "true" || value === "1";
}

export function useAppSettingsPage() {
  const translate = useTranslate();
  const { locale } = useLocale();
  const [page, setPage] = useState<SettingsPage | null>(null);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await apiGet<SettingsPage>("/app-settings");
    setPage(data);
  }, []);

  useEffect(() => {
    void load().catch((err) => {
      setError(apiErrorMessage(err, translate("appSettings.failed")));
    });
  }, [load, translate]);

  async function run(key: string, action: () => Promise<void>) {
    setBusyKey(key);
    setError("");
    try {
      await action();
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, translate("appSettings.failed")));
    } finally {
      setBusyKey("");
    }
  }

  return {
    translate,
    locale,
    page,
    busyKey,
    error,
    invitationLinksKey: APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
    expiresLabel: (expiresAt: string | null) =>
      expiresAt
        ? translate("appSettings.expires", {
            date: formatDateTime(expiresAt, locale),
          })
        : null,
    toggleSetting: (setting: SettingRow, open: boolean) =>
      void run(setting.key, async () => {
        await apiPatch("/app-settings", { key: setting.key, open: !open });
      }),
    extendBatch: (batchId: string) =>
      void run(`${batchId}:extend`, async () => {
        await apiPatch(`/app-settings/batches/${batchId}`, { extend: true });
      }),
    toggleBatch: (batch: BatchRow) =>
      void run(batch.id, async () => {
        await apiPatch(`/app-settings/batches/${batch.id}`, {
          open: !batch.linksOpen,
        });
      }),
    extendInvitation: (invitationId: string) =>
      void run(`${invitationId}:extend`, async () => {
        await apiPatch(`/app-settings/invitations/${invitationId}`, {
          extend: true,
        });
      }),
    toggleInvitation: (invitation: InvitationRow) =>
      void run(invitation.id, async () => {
        await apiPatch(`/app-settings/invitations/${invitation.id}`, {
          open: !invitation.invitationOpen,
        });
      }),
  };
}
