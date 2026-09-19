"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslate } from "@refinedev/core";
import Link from "next/link";

import { PaymentList } from "@/components/payments/payment-list";
import { StatusBadge } from "@/components/portal/status-badge";
import { Button } from "@/components/shared/ui/button";
import { PORTAL_SURFACE } from "@/constants/layout";
import { INVITATION_BATCH_STATUSES } from "@/constants/event-participation";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { apiPost } from "@/lib/client/api";
import {
  invitationDeliveryNotice,
  type InvitationDeliveryResult,
} from "@/lib/invitations/delivery-notice";
import { cn } from "@/lib/utils";
import { http } from "@/utils/axios";

type MembershipRow = {
  id: string;
  kind: string;
  status: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type BatchRow = {
  id: string;
  status: string;
  subject: string;
  kind: string;
  sentAt?: string | null;
};

export function EventOperations({ eventId }: { eventId: string }) {
  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <EventRoster eventId={eventId} />
      <InvitationBatchHistory eventId={eventId} />
      <div className="xl:col-span-2">
        <PaymentList eventId={eventId} />
      </div>
    </div>
  );
}

function EventRoster({ eventId }: { eventId: string }) {
  const translate = useTranslate();
  const { path } = useLocale();
  const [rows, setRows] = useState<MembershipRow[]>([]);

  const load = useCallback(async () => {
    const { data } = await http.get<MembershipRow[]>(
      `/events/${eventId}/memberships`
    );
    setRows(Array.isArray(data) ? data : []);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
      <h3 className="mb-3 text-lg font-semibold">
        {translate("events.roster")}
      </h3>
      <ul className="divide-y overflow-hidden rounded-md border">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          >
            <div className="min-w-0">
              {row.person ? (
                <Link
                  href={path(`/dashboard/people/show/${row.person.id}`)}
                  className="font-medium underline-offset-2 hover:underline"
                >
                  {row.person.firstName} {row.person.lastName}
                </Link>
              ) : (
                <span>{row.id}</span>
              )}
              <p className="text-sm text-muted-foreground">
                {row.person?.email} ·{" "}
                {translate(`payments.kinds.${row.kind}`, row.kind)}
              </p>
            </div>
            <StatusBadge namespace="membership" value={row.status} />
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-3 py-4 text-sm text-muted-foreground">
            {translate("empty")}
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function InvitationBatchHistory({ eventId }: { eventId: string }) {
  const translate = useTranslate();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const [rows, setRows] = useState<BatchRow[]>([]);

  const load = useCallback(async () => {
    const { data } = await http.get<BatchRow[]>(
      `/events/${eventId}/invitation-batches`,
      { params: { _start: 0, _end: 100 } }
    );
    setRows(Array.isArray(data) ? data : []);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
      <h3 className="mb-3 text-lg font-semibold">
        {translate("events.batches")}
      </h3>
      <ul className="divide-y overflow-hidden rounded-md border">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-medium">{row.subject}</p>
              <p className="text-sm text-muted-foreground">
                {translate(`payments.kinds.${row.kind}`, row.kind)}
                {row.sentAt ? ` · ${row.sentAt}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge namespace="batch" value={row.status} />
              {integrations.mailEnabled &&
              row.status !== INVITATION_BATCH_STATUSES.SENDING ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const payload = await apiPost<InvitationDeliveryResult>(
                        `/invitation-batches/${row.id}/send`
                      );
                      await load();
                      notify?.(
                        invitationDeliveryNotice(
                          payload,
                          true,
                          translate
                        )
                      );
                    }, translate("mailingLists.invitationsSendFailed"))
                  }
                >
                  {row.status === INVITATION_BATCH_STATUSES.SENT
                    ? translate("events.resendBatch")
                    : translate("events.sendBatch")}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-3 py-4 text-sm text-muted-foreground">
            {translate("empty")}
          </li>
        ) : null}
      </ul>
    </section>
  );
}
