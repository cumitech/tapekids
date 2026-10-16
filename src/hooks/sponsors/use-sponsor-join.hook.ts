"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslate } from "@refinedev/core";

import { PAYMENT_STATUSES } from "@/constants/event-participation";
import {
  SPONSOR_AMOUNT_XAF,
  acceptedSponsorAmount,
  latestCreatedEventId,
} from "@/constants/sponsor";
import { PAYMENT_POLL_MS } from "@/hooks/payments/use-watch-payment.hook";
import { unwrapEnvelope } from "@/lib/client/api";
import { http } from "@/utils/axios";

export type PublicEvent = { id: string; title: string; createdAt?: string | null };
export type SponsorCharge = {
  sponsor?: { id: string };
  payment?: { id: string; status: string; trackingId?: string };
  ussdCode?: string;
  link?: string;
  waived?: boolean;
  alreadyPaid?: boolean;
};

export function useSponsorJoinPage() {
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
  const [charge, setCharge] = useState<SponsorCharge | null>(null);

  useEffect(() => {
    void http.get("/public/events").then(({ data }) => {
      const rows = unwrapEnvelope<PublicEvent[]>(data);
      const list = Array.isArray(rows) ? rows : [];
      setEvents(list);
      setEventId((current) => current || latestCreatedEventId(list));
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
          const next = unwrapEnvelope<{ payment?: SponsorCharge["payment"] }>(
            data
          );
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
      setCharge(unwrapEnvelope<SponsorCharge>(data));
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

  return {
    translate,
    events,
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    anonymous,
    setAnonymous,
    eventId,
    setEventId,
    paymentPhone,
    setPaymentPhone,
    amount,
    setAmount,
    step,
    busy,
    error,
    charge,
    paid,
    sponsorAmount: SPONSOR_AMOUNT_XAF,
    continueToPayment,
    pay,
    backToDetails: () => setStep(1),
  };
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
