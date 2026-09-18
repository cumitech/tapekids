import { jsonOk } from "@/lib/api/http";
import { readJsonBody, staffRoute } from "@/lib/api/route-handler";
import { paymentService } from "@/services/payments/payment.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await paymentService.getById(params.id));
});

export const POST = staffRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await paymentService.refresh(params.id), "Payment refreshed");
});

export const PATCH = staffRoute<{ id: string }>(async ({ request, params }) => {
  return jsonOk(
    await paymentService.markStatus(params.id, await readJsonBody(request)),
    "Payment updated"
  );
});
