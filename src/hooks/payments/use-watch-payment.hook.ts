"use client";

import { useCallback, useEffect, useRef } from "react";

import { PAYMENT_STATUSES } from "@/constants/event-participation";
import { apiPost } from "@/lib/client/api";

export const PAYMENT_POLL_MS = 2500;
const MAX_ATTEMPTS = 48;

export type WatchedPayment = {
  id: string;
  status: string;
};

export function isPaymentSettled(status: string) {
  return (
    status === PAYMENT_STATUSES.PAID ||
    status === PAYMENT_STATUSES.WAIVED ||
    status === PAYMENT_STATUSES.FAILED
  );
}

export function isPaymentSuccessful(status: string) {
  return (
    status === PAYMENT_STATUSES.PAID || status === PAYMENT_STATUSES.WAIVED
  );
}

export function useWatchPayment() {
  const timerRef = useRef<number>(0);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    timerRef.current = 0;
  }, []);

  useEffect(() => stop, [stop]);

  const watch = useCallback(
    (
      refreshPath: string,
      onUpdate: (payment: WatchedPayment) => void
    ) => {
      stop();
      let attempts = 0;
      const tick = async () => {
        attempts += 1;
        try {
          const payment = await apiPost<WatchedPayment>(refreshPath);
          onUpdate(payment);
          if (isPaymentSettled(payment.status) || attempts >= MAX_ATTEMPTS) {
            stop();
          }
        } catch {
          if (attempts >= MAX_ATTEMPTS) {
            stop();
          }
        }
      };
      void tick();
      timerRef.current = window.setInterval(() => {
        void tick();
      }, PAYMENT_POLL_MS);
    },
    [stop]
  );

  return { watch, stop };
}
