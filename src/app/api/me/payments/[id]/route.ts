import { jsonOk } from "@/lib/api/http";
import { authedRoute } from "@/lib/api/route-handler";
import { meService } from "@/services/me/me.service";

export const runtime = "nodejs";

export const POST = authedRoute<{ id: string }>(async ({ params, user }) => {
  return jsonOk(
    await meService.refreshPayment(user, params.id),
    "Payment refreshed"
  );
});
