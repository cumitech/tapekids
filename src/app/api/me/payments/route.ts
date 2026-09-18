import { jsonList, jsonOk } from "@/lib/api/http";
import { authedRoute, readJsonBody } from "@/lib/api/route-handler";
import { toPaymentJson } from "@/lib/payments/public";
import { meService } from "@/services/me/me.service";

export const runtime = "nodejs";

export const GET = authedRoute(async ({ user }) => {
  const result = await meService.listPayments(user);
  return jsonList(
    result.data.map(toPaymentJson),
    result.total
  );
});

export const POST = authedRoute(async ({ request, user }) => {
  const result = await meService.initiatePayment(
    user,
    await readJsonBody(request)
  );
  return jsonOk(result, "Payment started", 201);
});
