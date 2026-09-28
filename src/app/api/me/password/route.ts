import { jsonOk } from "@/lib/api/http";
import { authedRoute, readJsonBody } from "@/lib/api/route-handler";
import { authService } from "@/services/auth/auth.service";

export const runtime = "nodejs";

export const POST = authedRoute(async ({ request, user }) => {
  return jsonOk(
    await authService.choosePassword(user.id, await readJsonBody(request)),
    "Password saved"
  );
});
