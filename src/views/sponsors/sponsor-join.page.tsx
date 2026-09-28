"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslate } from "@refinedev/core";

import { PhoneField } from "@/components/shared/form/phone-field";
import { LabeledSelect } from "@/components/shared/form/labeled-select";
import { AuthFormFrame } from "@/components/shared/refine-ui/form/auth-form-frame";
import { Button } from "@/components/shared/ui/button";
import { Checkbox } from "@/components/shared/ui/checkbox";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { RequiredMark } from "@/components/shared/form/required-mark";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@/components/shared/ui/separator";
import { PAYMENT_STATUSES } from "@/constants/event-participation";
import {
  SPONSOR_AMOUNT_XAF,
  acceptedSponsorAmount,
} from "@/constants/sponsor";
import { PAYMENT_POLL_MS } from "@/hooks/payments/use-watch-payment.hook";
import { unwrapEnvelope } from "@/lib/client/api";
import { http } from "@/utils/axios";
import { PublicShell } from "@/views/auth/public-shell";

type PublicEvent = { id: string; title: string };
type Charge = {
  sponsor?: { id: string };
  payment?: { id: string; status: string; trackingId?: string };
  ussdCode?: string;
  link?: string;
  waived?: boolean;
  alreadyPaid?: boolean;
};

export function SponsorJoinPage() {
  const translate = useTranslate();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [eventId, setEventId] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<Charge | null>(null);

  useEffect(() => {
    void http.get("/public/events").then(({ data }) => {
      const rows = unwrapEnvelope<PublicEvent[]>(data);
      setEvents(Array.isArray(rows) ? rows : []);
    });
  }, []);

  useEffect(() => {
    const sponsorId = charge?.sponsor?.id;
    const status = charge?.payment?.status;
    if (!sponsorId || !status || status !== PAYMENT_STATUSES.PENDING) {
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

  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !eventId) {
      setError(translate("sponsors.detailsRequired"));
      return;
    }
    setPaymentPhone((current) => current || phone);
    setStep(2);
  }

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!paymentPhone.trim()) {
      setError(translate("sponsors.phoneRequired"));
      return;
    }
    const parsedAmount = acceptedSponsorAmount(amount);
    if (parsedAmount == null) {
      setError(
        translate("sponsors.amountMinimum", { amount: SPONSOR_AMOUNT_XAF })
      );
      return;
    }
    setBusy(true);
    try {
      const { data } = await http.post("/sponsors", {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        anonymous,
        eventId,
        paymentPhone: paymentPhone.trim(),
        amount: parsedAmount,
      });
      setCharge(unwrapEnvelope<Charge>(data));
    } catch (cause) {
      setError(messageFromError(cause, translate("sponsors.failed")));
    } finally {
      setBusy(false);
    }
  }

  const paid =
    charge?.payment?.status === PAYMENT_STATUSES.PAID ||
    charge?.payment?.status === PAYMENT_STATUSES.WAIVED ||
    charge?.alreadyPaid ||
    charge?.waived;

  return (
    <PublicShell>
      <AuthFormFrame>
        <CardHeader className="px-0">
          <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
            {translate("sponsors.joinTitle")}
          </CardTitle>
          <CardDescription className="font-medium text-muted-foreground">
            {translate("sponsors.joinDescription")}
          </CardDescription>
        </CardHeader>
        <Separator />
        {paid ? (
          <div className="flex flex-col gap-2 font-serif text-base leading-relaxed">
            <p>{translate("sponsors.paid")}</p>
            {charge?.payment?.trackingId ? (
              <p>
                {translate("payments.fields.trackingId")}:{" "}
                <span className="font-mono">{charge.payment.trackingId}</span>
              </p>
            ) : null}
          </div>
        ) : charge ? (
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
        ) : step === 1 ? (
          <form className="flex flex-col gap-4" onSubmit={continueToPayment}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-name">
                {translate("people.fields.fullName")}
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-email">
                {translate("people.fields.email")}
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <PhoneField
              id="sponsor-phone"
              label={translate("people.fields.phone")}
              value={phone}
              onChange={setPhone}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={anonymous}
                onCheckedChange={(checked) => setAnonymous(checked === true)}
              />
              {translate("sponsors.anonymous")}
            </label>
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
            <Button type="submit">{translate("people.steps.next")}</Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={pay}>
            <p className="text-sm text-muted-foreground">
              {translate("sponsors.paymentHint")}
            </p>
            <PhoneField
              id="sponsor-payment-phone"
              label={translate("sponsors.paymentPhone")}
              value={paymentPhone}
              onChange={setPaymentPhone}
              required
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="sponsor-amount">
                {translate("payments.fields.amount")} (XAF)
                <RequiredMark required />
              </Label>
              <Input
                id="sponsor-amount"
                type="number"
                min={SPONSOR_AMOUNT_XAF}
                step={1}
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={translate("payments.amountPlaceholder")}
                required
              />
              <p className="text-xs text-muted-foreground">
                {translate("sponsors.amountMinimum", {
                  amount: SPONSOR_AMOUNT_XAF,
                })}
              </p>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                {translate("people.steps.back")}
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? translate("sponsors.paying") : translate("sponsors.pay")}
              </Button>
            </div>
          </form>
        )}
      </AuthFormFrame>
    </PublicShell>
  );
}

function messageFromError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message && message !== "Validation failed") {
      return message;
    }
  }
  return fallback;
}
