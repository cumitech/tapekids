import { campayConfig, isCampayConfigured } from "@/lib/integrations/campay.config";
import { appBaseUrl, isMailConfigured } from "@/lib/integrations/env";

export function publicIntegrations() {
  const campay = campayConfig();
  return {
    mailEnabled: isMailConfigured(),
    campayEnabled: isCampayConfigured(),
    livePricing: campay.environment === "PROD",
    currency: campay.currency,
    campayWebhookUrl: `${appBaseUrl()}/api/payments/campay/webhook`,
  };
}
