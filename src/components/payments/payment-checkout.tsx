"use client";

import { useTranslate } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { useState, useRef } from "react";

import { EventSelect } from "@/components/events/event-select";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { PhoneField } from "@/components/shared/form/phone-field";
import { MembershipKindSelect } from "@/components/shared/form/membership-kind-select";
import { Button } from "@/components/shared/ui/button";
import {
  EVENT_MEMBERSHIP_KINDS,
  PAYMENT_STATUSES,
  type EventMembershipKind,
} from "@/constants/event-participation";
import { useBusyAction } from "@/hooks/core/use-busy-action.hook";
import { useIntegrations } from "@/hooks/integrations/use-integrations.hook";
import {
  isPaymentSuccessful,
  useWatchPayment,
} from "@/hooks/payments/use-watch-payment.hook";
import { apiPost } from "@/lib/client/api";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payments/charge";

type PaymentCheckoutProps = {
  personId: string;
  defaultPhone?: string | null;
  eventId?: string;
  kind?: EventMembershipKind;
  lockSelection?: boolean;
  hideTitle?: boolean;
  endpoint?: string;
  redirectPath?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
};

type ChargeResult = {
  payment?: { id: string; status: string };
  ussdCode?: string;
  link?: string;
  waived?: boolean;
  alreadyPaid?: boolean;
};

export function PaymentCheckout({
  personId,
  defaultPhone,
  eventId: eventIdProp,
  kind: kindProp,
  lockSelection = false,
  hideTitle = false,
  endpoint = "/payments",
  redirectPath,
  onCancel,
  onSuccess,
}: PaymentCheckoutProps) {
  const translate = useTranslate();
  const integrations = useIntegrations();
  const { busy, run, notify } = useBusyAction();
  const { watch } = useWatchPayment();
  const settledRef = useRef(false);
  const [eventId, setEventId] = useState(eventIdProp ?? "");
  const [kind, setKind] = useState<EventMembershipKind>(
    kindProp ?? EVENT_MEMBERSHIP_KINDS.CAMPER
  );
  const [method, setMethod] = useState<PaymentMethod>(PAYMENT_METHODS.MOMO);
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [result, setResult] = useState<ChargeResult | null>(null);
  const [watching, setWatching] = useState(false);
  const refreshBase = endpoint === "/me/payments" ? "/me/payments" : "/payments";

  const finishIfSettled = (status: string) => {
    if (settledRef.current) {
      return true;
    }
    if (isPaymentSuccessful(status)) {
      settledRef.current = true;
      setWatching(false);
      notify?.({
        type: "success",
        message: translate("payments.paidSuccess"),
      });
      onSuccess?.();
      return true;
    }
    if (status === PAYMENT_STATUSES.FAILED) {
      settledRef.current = true;
      setWatching(false);
      notify?.({
        type: "error",
        message: translate("payments.failedStatus"),
      });
      return true;
    }
    return false;
  };

  const listenForPayment = (paymentId: string, status?: string) => {
    if (status && finishIfSettled(status)) {
      return;
    }
    setWatching(true);
    watch(`${refreshBase}/${paymentId}`, (payment) => {
      finishIfSettled(payment.status);
    });
  };

  if (!integrations.campayEnabled) {
    return (
      <p className="text-sm text-muted-foreground">{translate("payments.disabled")}</p>
    );
  }

  return (
    <section className="flex max-w-xl flex-col gap-3">
      {hideTitle ? null : (
        <h3 className="text-lg font-semibold">
          {lockSelection ? translate("portal.pay") : translate("payments.title")}
        </h3>
      )}
      {lockSelection ? null : (
        <>
          <EventSelect value={eventId} onChange={setEventId} />
          <MembershipKindSelect
            label={translate("payments.kind")}
            value={kind}
            onChange={setKind}
          />
        </>
      )}
      <LabeledSelect
        label={translate("payments.method")}
        value={method}
        onChange={(value) => setMethod(value as PaymentMethod)}
        options={[
          { value: PAYMENT_METHODS.MOMO, label: translate("payments.momo") },
          { value: PAYMENT_METHODS.LINK, label: translate("payments.link") },
        ]}
      />
      <PhoneField
        label={translate("payments.phone")}
        value={phone}
        onChange={setPhone}
        required={method === PAYMENT_METHODS.MOMO}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy || watching || !eventId}
          onClick={() =>
            run(async () => {
              const payload = await apiPost<ChargeResult>(endpoint, {
                eventId,
                personId,
                kind,
                method,
                phone: phone || undefined,
                redirectPath,
              });
              setResult(payload);
              if (payload.alreadyPaid || payload.waived) {
                settledRef.current = true;
                notify?.({
                  type: "success",
                  message: translate("payments.paidSuccess"),
                });
                onSuccess?.();
                return;
              }
              if (!payload.payment?.id) {
                notify?.({
                  type: "success",
                  message: translate("payments.started"),
                });
                return;
              }
              notify?.({
                type: "success",
                message: translate("payments.started"),
              });
              listenForPayment(payload.payment.id, payload.payment.status);
            }, translate("payments.failed"))
          }
        >
          {translate("payments.charge")}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {translate("buttons.cancel")}
          </Button>
        ) : null}
      </div>
      {watching ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {translate("payments.waiting")}
        </p>
      ) : null}
      {result?.ussdCode ? (
        <p className="text-sm">
          {translate("payments.ussd")}: <strong>{result.ussdCode}</strong>
        </p>
      ) : null}
      {result?.link ? (
        <a className="text-sm underline" href={result.link} target="_blank" rel="noreferrer">
          {translate("payments.openLink")}
        </a>
      ) : null}
      {result?.waived ? (
        <p className="text-sm text-muted-foreground">{translate("payments.waived")}</p>
      ) : null}
      {result?.alreadyPaid ? (
        <p className="text-sm text-muted-foreground">{translate("payments.alreadyPaid")}</p>
      ) : null}
    </section>
  );
}
