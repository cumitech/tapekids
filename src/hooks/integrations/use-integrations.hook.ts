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

export function useIntegrations() {
  const [status, setStatus] = useState<IntegrationsStatus>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    apiGet<IntegrationsStatus>("/integrations")
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
