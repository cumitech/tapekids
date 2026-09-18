import { jsonOk } from "@/lib/api/http";
import { publicRoute, readJsonBody } from "@/lib/api/route-handler";
import { authService } from "@/services/auth/auth.service";

export const runtime = "nodejs";

export const POST = publicRoute(async ({ request }) => {
  const result = await authService.forgotPassword(await readJsonBody(request));
  return jsonOk(result, "If that email exists, a reset link was sent.");
});
