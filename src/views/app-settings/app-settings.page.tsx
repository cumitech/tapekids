"use client";

import { StatusBadge } from "@/components/portal/status-badge";
import { ListView, ListViewHeader } from "@/components/shared/refine-ui/views/list-view";
import { Button } from "@/components/shared/ui/button";
import { PORTAL_SURFACE } from "@/constants/layout";
import {
  isBooleanOpen,
  useAppSettingsPage,
} from "@/hooks/app-settings/use-app-settings.hook";
import { cn } from "@/lib/utils";

export function AppSettingsPage() {
  const page = useAppSettingsPage();
  const { translate } = page;

  return (
    <ListView>
      <ListViewHeader canCreate={false} />
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          {translate("appSettings.description")}
        </p>
        {page.error ? (
          <p className="text-sm text-destructive">{page.error}</p>
        ) : null}

        <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
          <h2 className="text-lg font-semibold">
            {translate("appSettings.settingsTitle")}
          </h2>
          <ul className="mt-3 divide-y overflow-hidden rounded-md border">
            {(page.page?.settings ?? []).map((setting) => {
              const open =
                setting.type === "boolean" && isBooleanOpen(setting.value);
              const known = setting.key === page.invitationLinksKey;
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
                      disabled={page.busyKey === setting.key}
                      onClick={() => page.toggleSetting(setting, open)}
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
            {(page.page?.batches ?? []).map((batch) => (
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
                    disabled={page.busyKey === `${batch.id}:extend`}
                    onClick={() => page.extendBatch(batch.id)}
                  >
                    {translate("appSettings.extendBatch")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={batch.linksOpen ? "outline" : "default"}
                    disabled={page.busyKey === batch.id}
                    onClick={() => page.toggleBatch(batch)}
                  >
                    {batch.linksOpen
                      ? translate("appSettings.closeBatch")
                      : translate("appSettings.reopenBatch")}
                  </Button>
                </div>
              </li>
            ))}
            {page.page && page.page.batches.length === 0 ? (
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
            {(page.page?.invitations ?? []).map((invitation) => (
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
                    {page.expiresLabel(invitation.expiresAt)}
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
                    disabled={page.busyKey === `${invitation.id}:extend`}
                    onClick={() => page.extendInvitation(invitation.id)}
                  >
                    {translate("appSettings.extendInvitation")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={invitation.invitationOpen ? "outline" : "default"}
                    disabled={page.busyKey === invitation.id}
                    onClick={() => page.toggleInvitation(invitation)}
                  >
                    {invitation.invitationOpen
                      ? translate("appSettings.closeInvitation")
                      : translate("appSettings.reopenInvitation")}
                  </Button>
                </div>
              </li>
            ))}
            {page.page && page.page.invitations.length === 0 ? (
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
