import { jsonOk } from "@/lib/api/http";
import { readJsonBody, adminRoute } from "@/lib/api/route-handler";
import { paymentService } from "@/services/payments/payment.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await paymentService.getById(params.id));
});

export const POST = adminRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await paymentService.refresh(params.id), "Payment refreshed");
});

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  return jsonOk(
    await paymentService.markStatus(params.id, await readJsonBody(request)),
    "Payment updated"
  );
});
