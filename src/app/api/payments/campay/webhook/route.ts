import {
  parseCampayWebhook,
  verifiedCampayWebhookPayload,
} from "@/adapters/payments/campay/webhook";
import { ensureDb } from "@/database/db-sequelize.config";
import { jsonFail, jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { campayConfig } from "@/lib/integrations/campay.config";
import { paymentService } from "@/services/payments/payment.service";

export const runtime = "nodejs";

const handleWebhook = publicRoute(
  async ({ request }) => {
    const secret = campayConfig().webhookSecret;
    if (!secret) {
      return jsonFail("CamPay webhook secret is not configured.", 500);
    }

    const payload = await parseCampayWebhook(request);
    const verified = verifiedCampayWebhookPayload(payload, secret);
    if (!verified) {
      return jsonFail("Invalid CamPay webhook signature.", 401);
    }

    await ensureDb();
    const payment = await paymentService.applyWebhook(verified);
    return jsonOk({
      paymentId: payment.id,
      status: payment.status,
      reference: verified.reference,
    });
  },
  { db: false }
);

export const GET = handleWebhook;
export const POST = handleWebhook;
