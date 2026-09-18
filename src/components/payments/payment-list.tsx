"use client";

import { useTranslate } from "@refinedev/core";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "@/components/portal/status-badge";
import { Button } from "@/components/shared/ui/button";
import { PAYMENT_STATUSES, type PaymentKind } from "@/constants/event-participation";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { PAYMENT_POLL_MS } from "@/hooks/payments/use-watch-payment.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import { apiPatch, apiPost } from "@/lib/client/api";
import { formatMoney } from "@/lib/format";
import { membershipKindFromPaymentKind } from "@/lib/payments/charge";
import { cn } from "@/lib/utils";
import { http } from "@/utils/axios";

export type PaymentRow = {
  id: string;
  eventId: string;
  personId: string;
  kind: string;
  amount: string;
  currency: string;
  status: string;
  providerRef?: string | null;
  person?: { firstName: string; lastName: string; email: string };
  event?: { id: string; title: string };
};

type PaymentListProps = {
  eventId?: string;
  personId?: string;
  source?: "staff" | "self";
  compact?: boolean;
};

export function PaymentList({
  eventId,
  personId,
  source = "staff",
  compact = false,
}: PaymentListProps) {
  const translate = useTranslate();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const isSelf = source === "self";
  const listPath = isSelf ? "/me/payments" : "/payments";
  const refreshPath = (id: string) =>
    isSelf ? `/me/payments/${id}` : `/payments/${id}`;

  const load = useCallback(async () => {
    const { data } = await http.get<PaymentRow[]>(listPath, {
      params: isSelf
        ? { _start: 0, _end: 100 }
        : {
            eventId,
            personId,
            _start: 0,
            _end: 100,
          },
    });
    setRows(Array.isArray(data) ? data : []);
  }, [eventId, personId, isSelf, listPath]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const pending = rows.filter((row) => row.status === PAYMENT_STATUSES.PENDING);
    if (pending.length === 0) {
      return;
    }
    const timer = window.setInterval(() => {
      void (async () => {
        await Promise.all(
          pending.map((row) =>
            apiPost(refreshPath(row.id)).catch(() => undefined)
          )
        );
        await load();
      })();
    }, PAYMENT_POLL_MS);
    return () => window.clearInterval(timer);
  }, [rows, load]);

  return (
    <section className="flex flex-col gap-3">
      <h3
        className={
          compact
            ? "text-sm font-semibold text-[#182356] dark:text-foreground"
            : "text-lg font-semibold"
        }
      >
        {translate("payments.listTitle")}
      </h3>
      {eventId && !isSelf && integrations.campayWebhookUrl ? (
        <p className="break-all text-sm text-muted-foreground">
          {translate("payments.webhookHint")}: {integrations.campayWebhookUrl}
        </p>
      ) : null}
      <ul
        className={cn(
          "divide-y overflow-hidden rounded-xl border",
          isSelf ? "border-border bg-accent/40" : "rounded-md bg-white dark:bg-card"
        )}
      >
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              "flex gap-3 px-4 py-3",
              compact
                ? "flex-col items-stretch"
                : "flex-wrap items-center justify-between"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {row.event?.title
                  ? row.event.title
                  : isSelf
                    ? translate("portal.unknownEvent")
                    : row.person
                      ? `${row.person.firstName} ${row.person.lastName}`
                      : row.personId}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {!isSelf && row.person
                  ? `${row.person.firstName} ${row.person.lastName} · `
                  : ""}
                {translate(
                  `payments.kinds.${membershipKindFromPaymentKind(row.kind as PaymentKind)}`
                )}{" "}
                · {formatMoney(row.amount, row.currency)}
              </p>
            </div>
            <div
              className={cn(
                "flex flex-wrap items-center gap-2",
                compact && "justify-start"
              )}
            >
              <StatusBadge namespace="payment" value={row.status} />
              {row.status === PAYMENT_STATUSES.PENDING ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await apiPost(refreshPath(row.id));
                      await load();
                      notify?.({
                        type: "success",
                        message: translate("payments.refreshed"),
                      });
                    }, translate("payments.failed"))
                  }
                >
                  {translate("payments.refresh")}
                </Button>
              ) : null}
              {!isSelf && row.status !== PAYMENT_STATUSES.PAID ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await apiPatch(`/payments/${row.id}`, {
                        status: PAYMENT_STATUSES.PAID,
                      });
                      await load();
                    }, translate("payments.failed"))
                  }
                >
                  {translate("payments.markPaid")}
                </Button>
              ) : null}
              {!isSelf &&
              row.status !== PAYMENT_STATUSES.WAIVED &&
              row.status !== PAYMENT_STATUSES.PAID ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await apiPatch(`/payments/${row.id}`, {
                        status: PAYMENT_STATUSES.WAIVED,
                      });
                      await load();
                    }, translate("payments.failed"))
                  }
                >
                  {translate("payments.markWaived")}
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
