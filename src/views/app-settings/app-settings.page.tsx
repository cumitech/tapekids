"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";

import { StatusBadge } from "@/components/portal/status-badge";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { APP_SETTING_KEYS } from "@/constants/app-settings";
import { PORTAL_SURFACE } from "@/constants/layout";
import { apiErrorMessage, apiGet, apiPatch } from "@/lib/client/api";
import { formatDateTime } from "@/lib/format";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { cn } from "@/lib/utils";

type SettingRow = {
  key: string;
  type: "boolean" | "text";
  value: string;
};

type BatchRow = {
  id: string;
  subject: string;
  kind: string;
  status: string;
  linksOpen: boolean;
  eventTitle: string;
};

type InvitationRow = {
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

function isBooleanOpen(value: string) {
  return value === "true" || value === "1";
}

export function AppSettingsPage() {
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

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          {translate("appSettings.description")}
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
          <h2 className="text-lg font-semibold">
            {translate("appSettings.settingsTitle")}
          </h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-md border">
            {(page?.settings ?? []).map((setting) => {
              const open = setting.type === "boolean" && isBooleanOpen(setting.value);
              const known = setting.key === APP_SETTING_KEYS.INVITATION_LINKS_OPEN;
              return (
                <li
                  key={setting.key}
                  className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {known
                        ? translate("appSettings.invitationLinks.title")
                        : setting.key}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {known
                        ? open
                          ? translate("appSettings.invitationLinks.open")
                          : translate("appSettings.invitationLinks.closed")
                        : setting.value}
                    </p>
                  </div>
                  {setting.type === "boolean" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={open ? "outline" : "default"}
                      disabled={busyKey === setting.key}
                      onClick={() =>
                        void run(setting.key, async () => {
                          await apiPatch("/app-settings", {
                            key: setting.key,
                            open: !open,
                          });
                        })
                      }
                    >
                      {known
                        ? open
                          ? translate("appSettings.invitationLinks.close")
                          : translate("appSettings.invitationLinks.reopen")
                        : open
                          ? translate("appSettings.close")
                          : translate("appSettings.reopen")}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
          <h2 className="text-lg font-semibold">
            {translate("appSettings.batchesTitle")}
          </h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-md border">
            {(page?.batches ?? []).map((batch) => (
              <li
                key={batch.id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{batch.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {batch.eventTitle} ·{" "}
                    {translate(`payments.kinds.${batch.kind}`, batch.kind)} ·{" "}
                    {batch.linksOpen
                      ? translate("appSettings.linkOpen")
                      : translate("appSettings.linkClosed")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge namespace="batch" value={batch.status} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyKey === `${batch.id}:extend`}
                    onClick={() =>
                      void run(`${batch.id}:extend`, async () => {
                        await apiPatch(`/app-settings/batches/${batch.id}`, {
                          extend: true,
                        });
                      })
                    }
                  >
                    {translate("appSettings.extendBatch")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={batch.linksOpen ? "outline" : "default"}
                    disabled={busyKey === batch.id}
                    onClick={() =>
                      void run(batch.id, async () => {
                        await apiPatch(`/app-settings/batches/${batch.id}`, {
                          open: !batch.linksOpen,
                        });
                      })
                    }
                  >
                    {batch.linksOpen
                      ? translate("appSettings.closeBatch")
                      : translate("appSettings.reopenBatch")}
                  </Button>
                </div>
              </li>
            ))}
            {page && page.batches.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">
                {translate("empty")}
              </li>
            ) : null}
          </ul>
        </section>

        <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
          <h2 className="text-lg font-semibold">
            {translate("appSettings.invitationsTitle")}
          </h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-md border">
            {(page?.invitations ?? []).map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{invitation.personName}</p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.email} · {invitation.eventTitle} ·{" "}
                    {invitation.batchSubject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.expiresAt
                      ? translate("appSettings.expires", {
                          date: formatDateTime(invitation.expiresAt, locale),
                        })
                      : null}
                    {invitation.expiresAt ? " · " : null}
                    {invitation.invitationOpen
                      ? translate("appSettings.linkOpen")
                      : translate("appSettings.linkClosed")}
                    {invitation.batchLinksOpen
                      ? ""
                      : ` · ${translate("appSettings.batchClosed")}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge namespace="invitation" value={invitation.status} />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyKey === `${invitation.id}:extend`}
                    onClick={() =>
                      void run(`${invitation.id}:extend`, async () => {
                        await apiPatch(
                          `/app-settings/invitations/${invitation.id}`,
                          { extend: true }
                        );
                      })
                    }
                  >
                    {translate("appSettings.extendInvitation")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={invitation.invitationOpen ? "outline" : "default"}
                    disabled={busyKey === invitation.id}
                    onClick={() =>
                      void run(invitation.id, async () => {
                        await apiPatch(
                          `/app-settings/invitations/${invitation.id}`,
                          { open: !invitation.invitationOpen }
                        );
                      })
                    }
                  >
                    {invitation.invitationOpen
                      ? translate("appSettings.closeInvitation")
                      : translate("appSettings.reopenInvitation")}
                  </Button>
                </div>
              </li>
            ))}
            {page && page.invitations.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted-foreground">
                {translate("empty")}
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </ListView>
  );
}
