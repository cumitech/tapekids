import { jsonOk } from "@/lib/api/http";
import { publicRoute, readJsonBody } from "@/lib/api/route-handler";
import { authService } from "@/services/auth/auth.service";

export const runtime = "nodejs";

export const POST = publicRoute(async ({ request }) => {
  const result = await authService.register(await readJsonBody(request));
  const pending =
    "requiresVerification" in result && result.requiresVerification;
  return jsonOk(
    result,
    pending
      ? "Check your email to confirm your account."
      : "Account created",
    201
  );
});
