import { isCampayConfigured } from "@/lib/integrations/campay.config";
import { CampayAdapter } from "./campay/campay.adapter";
import type { PaymentAdapter } from "./types";

let adapter: PaymentAdapter | null = null;

export function getPaymentAdapter(): PaymentAdapter {
  if (!isCampayConfigured()) {
    throw new Error("CamPay is not configured.");
  }
  if (!adapter) {
    adapter = new CampayAdapter();
  }
  return adapter;
}

export type {
  CollectInput,
  PaymentAdapter,
  PaymentLinkInput,
  ProviderChargeResult,
} from "./types";
