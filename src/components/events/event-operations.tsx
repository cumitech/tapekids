"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslate } from "@refinedev/core";
import { Search, X } from "lucide-react";
import Link from "next/link";

import { EventJoinLink } from "@/components/events/event-join-link";
import { AssignYfIdButton } from "@/components/people/assign-yf-id-button";
import { InvitationRecipients } from "@/components/invitations/invitation-deliveries";
import { useAppModal } from "@/components/shared/modals/app-modal";
import { PaymentList } from "@/components/payments/payment-list";
import { StatusBadge } from "@/components/portal/status-badge";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PORTAL_SURFACE } from "@/constants/layout";
import { INVITATION_BATCH_STATUSES } from "@/constants/event-participation";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useLocale } from "@/hooks/core/use-locale.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { formatDateTime } from "@/lib/format";
import { normalizeYfId } from "@/lib/people/yf-id";
import { invitationDeliveryNotice } from "@/lib/invitations/delivery-notice";
import { sendInvitationBatch } from "@/lib/invitations/send-batch";
import { cn } from "@/lib/utils";
import { http } from "@/utils/axios";

type MembershipRow = {
  id: string;
  kind: string;
  status: string;
    person?: {
      id: string;
      fullName: string;
      email?: string | null;
      yfId?: string | null;
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
      <div className="xl:col-span-2">
        <EventJoinLink eventId={eventId} />
      </div>
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
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const { data } = await http.get<MembershipRow[]>(
      `/events/${eventId}/memberships`
    );
    setRows(Array.isArray(data) ? data : []);
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => rows.filter((row) => rosterMatches(row, query)),
    [query, rows]
  );

  return (
    <section className={cn(PORTAL_SURFACE, "bg-white p-5 dark:bg-card")}>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">{translate("events.roster")}</h3>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground md:left-2.5 md:size-4" />
          <Input
            value={query}
            placeholder={translate("events.rosterSearch")}
            aria-label={translate("events.rosterSearch")}
            className="bg-white pl-11 pr-12 dark:bg-card md:pl-8 md:pr-8"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 size-10 -translate-y-1/2 text-muted-foreground md:right-0.5 md:size-7"
              onClick={() => setQuery("")}
            >
              <X className="size-3.5" />
              <span className="sr-only">{translate("buttons.clear")}</span>
            </Button>
          ) : null}
        </div>
      </div>
      <ul className="divide-y overflow-hidden rounded-md border">
        {visible.map((row) => (
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
                  {row.person.fullName}
                </Link>
              ) : (
                <span>{row.id}</span>
              )}
              <p className="text-sm text-muted-foreground">
                {row.person?.email} ·{" "}
                {translate(`payments.kinds.${row.kind}`, row.kind)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {row.person ? (
                <AssignYfIdButton
                  personId={row.person.id}
                  fullName={row.person.fullName}
                  yfId={row.person.yfId}
                  onSaved={() => {
                    void load();
                  }}
                />
              ) : null}
              <StatusBadge namespace="membership" value={row.status} />
            </div>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-3 py-4 text-sm text-muted-foreground">
            {translate(query.trim() ? "events.rosterNoMatch" : "empty")}
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function rosterMatches(row: MembershipRow, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  const person = row.person;
  if (!person) {
    return false;
  }
  if (person.fullName.toLowerCase().includes(needle)) {
    return true;
  }
  if (person.email?.toLowerCase().includes(needle)) {
    return true;
  }
  const yfId = normalizeYfId(person.yfId).toLowerCase();
  const compact = normalizeYfId(needle).toLowerCase();
  return Boolean(compact) && yfId.includes(compact);
}

function InvitationBatchHistory({ eventId }: { eventId: string }) {
  const translate = useTranslate();
  const { locale } = useLocale();
  const { openModal } = useAppModal();
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
                {row.sentAt ? ` · ${formatDateTime(row.sentAt, locale)}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge namespace="batch" value={row.status} />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  openModal({
                    title: row.subject || translate("events.recipients"),
                    className: "sm:max-w-4xl",
                    body: <InvitationRecipients batchId={row.id} />,
                  })
                }
              >
                {translate("events.recipients")}
              </Button>
              {integrations.mailEnabled &&
              row.status !== INVITATION_BATCH_STATUSES.SENDING ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const payload = await sendInvitationBatch(row.id);
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
