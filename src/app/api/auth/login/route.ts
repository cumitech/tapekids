import { jsonOk } from "@/lib/api/http";
import { publicRoute, readJsonBody } from "@/lib/api/route-handler";
import { authService } from "@/services/auth/auth.service";

export const runtime = "nodejs";

export const POST = publicRoute(async ({ request }) => {
  const session = await authService.login(await readJsonBody(request));
  return jsonOk(session, "Signed in");
});
