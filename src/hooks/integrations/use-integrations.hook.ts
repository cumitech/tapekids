"use client";

import { useEffect, useState } from "react";

import { apiGet } from "@/lib/client/api";

export type IntegrationsStatus = {
  mailEnabled: boolean;
  campayEnabled: boolean;
  livePricing?: boolean;
  currency: string;
  campayWebhookUrl: string;
};

const EMPTY: IntegrationsStatus = {
  mailEnabled: false,
  campayEnabled: false,
  livePricing: false,
  currency: "XAF",
  campayWebhookUrl: "",
};

let cached: IntegrationsStatus | null = null;
let pending: Promise<IntegrationsStatus> | null = null;

function loadIntegrations() {
  if (cached) {
    return Promise.resolve(cached);
  }
  if (!pending) {
    pending = apiGet<IntegrationsStatus>("/integrations")
      .then((data) => {
        cached = data;
        return data;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export function useIntegrations() {
  const [status, setStatus] = useState<IntegrationsStatus>(cached ?? EMPTY);

  useEffect(() => {
    let cancelled = false;
    void loadIntegrations()
      .then((data) => {
        if (!cancelled) {
          setStatus(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus(EMPTY);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
