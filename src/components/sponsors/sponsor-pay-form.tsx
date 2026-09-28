"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslate } from "@refinedev/core";

import { FormField } from "@/components/shared/form/form-field";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { PhoneField } from "@/components/shared/form/phone-field";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { PAYMENT_STATUSES } from "@/constants/event-participation";
import {
  SPONSOR_AMOUNT_XAF,
  acceptedSponsorAmount,
} from "@/constants/sponsor";
import { PAYMENT_POLL_MS } from "@/hooks/payments/use-watch-payment.hook";
import { unwrapEnvelope } from "@/lib/client/api";
import { http } from "@/utils/axios";

type PublicEvent = { id: string; title: string };

type Charge = {
  sponsor?: { id: string };
  payment?: { id: string; status: string; trackingId?: string };
  ussdCode?: string;
  link?: string;
  waived?: boolean;
  alreadyPaid?: boolean;
};

type SponsorPayFormProps = {
  accountName: string;
  fullName: string;
  email: string;
  defaultPhone?: string | null;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function SponsorPayForm({
  accountName,
  fullName,
  email,
  defaultPhone,
  onCancel,
  onSuccess,
}: SponsorPayFormProps) {
  const translate = useTranslate();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<Charge | null>(null);

  useEffect(() => {
    void http.get("/public/events").then(({ data }) => {
      const rows = unwrapEnvelope<PublicEvent[]>(data);
      const list = Array.isArray(rows) ? rows : [];
      setEvents(list);
      if (list.length === 1) {
        setEventId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const sponsorId = charge?.sponsor?.id;
    const status = charge?.payment?.status;
    if (!sponsorId || status !== PAYMENT_STATUSES.PENDING) {
      return;
    }
    const timer = window.setInterval(() => {
      void http
        .post(`/sponsors/${sponsorId}/refresh`)
        .then(({ data }) => {
          const next = unwrapEnvelope<{ payment?: Charge["payment"] }>(data);
          if (!next.payment) {
            return;
          }
          setCharge((current) =>
            current ? { ...current, payment: next.payment } : current
          );
        })
        .catch(() => undefined);
    }, PAYMENT_POLL_MS);
    return () => window.clearInterval(timer);
  }, [charge?.sponsor?.id, charge?.payment?.status]);

  const paid =
    charge?.payment?.status === PAYMENT_STATUSES.PAID ||
    charge?.payment?.status === PAYMENT_STATUSES.WAIVED ||
    charge?.alreadyPaid ||
    charge?.waived;

  async function launch() {
    setError("");
    const parsedAmount = acceptedSponsorAmount(amount);
    if (!email.trim()) {
      setError(translate("sponsors.emailRequired"));
      return;
    }
    if (!eventId) {
      setError(translate("sponsors.eventRequired"));
      return;
    }
    if (!phone.trim()) {
      setError(translate("sponsors.phoneRequired"));
      return;
    }
    if (parsedAmount == null) {
      setError(
        translate("sponsors.amountMinimum", { amount: SPONSOR_AMOUNT_XAF })
      );
      return;
    }

    setBusy(true);
    try {
      const { data } = await http.post("/sponsors", {
        fullName: fullName.trim() || accountName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        anonymous: false,
        eventId,
        paymentPhone: phone.trim(),
        amount: parsedAmount,
      });
      setCharge(unwrapEnvelope<Charge>(data));
    } catch (cause) {
      setError(messageFromError(cause, translate("sponsors.failed")));
    } finally {
      setBusy(false);
    }
  }

  if (paid) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p>{translate("sponsors.paid")}</p>
        {charge?.payment?.trackingId ? (
          <p>
            {translate("payments.fields.trackingId")}:{" "}
            <span className="font-mono">{charge.payment.trackingId}</span>
          </p>
        ) : null}
        <Button
          type="button"
          onClick={() => {
            onSuccess?.();
            onCancel?.();
          }}
        >
          {translate("buttons.close", "Close")}
        </Button>
      </div>
    );
  }

  if (charge) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p>{translate("sponsors.waiting")}</p>
        {charge.ussdCode ? (
          <p>
            {translate("payments.ussd")}: <strong>{charge.ussdCode}</strong>
          </p>
        ) : null}
        {charge.link ? (
          <a className="underline" href={charge.link} target="_blank" rel="noreferrer">
            {translate("payments.openLink")}
          </a>
        ) : null}
        {charge.payment?.trackingId ? (
          <p className="font-mono">{charge.payment.trackingId}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormField label={translate("payments.username")}>
        <Input
          value={accountName}
          readOnly
          disabled
          className="bg-muted text-foreground disabled:opacity-100"
        />
      </FormField>
      <PhoneField
        label={translate("sponsors.paymentPhone")}
        value={phone}
        onChange={setPhone}
        required
      />
      <FormField
        label={`${translate("payments.fields.amount")} (XAF)`}
        required
        error={
          amount && acceptedSponsorAmount(amount) == null
            ? translate("sponsors.amountMinimum", {
                amount: SPONSOR_AMOUNT_XAF,
              })
            : undefined
        }
      >
        <Input
          type="number"
          min={SPONSOR_AMOUNT_XAF}
          step={1}
          inputMode="numeric"
          placeholder={translate("payments.amountPlaceholder")}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {translate("sponsors.amountMinimum", { amount: SPONSOR_AMOUNT_XAF })}
        </p>
      </FormField>
      <LabeledSelect
        label={translate("sponsors.event")}
        value={eventId}
        onChange={setEventId}
        required
        placeholder={translate("sponsors.eventPlaceholder")}
        options={events.map((event) => ({
          value: event.id,
          label: event.title,
        }))}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => void launch()}>
          {busy ? translate("sponsors.paying") : translate("sponsors.pay")}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {translate("buttons.cancel")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function messageFromError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { message?: string }[] }
      | undefined;
    const detail = data?.errors?.find((item) => item.message)?.message;
    if (detail) {
      return detail;
    }
    if (data?.message && data.message !== "Validation failed") {
      return data.message;
    }
  }
  return fallback;
}
