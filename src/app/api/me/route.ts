import { jsonOk } from "@/lib/api/http";
import { authedRoute, readJsonBody } from "@/lib/api/route-handler";
import { meService } from "@/services/me/me.service";

export const runtime = "nodejs";

export const GET = authedRoute(async ({ user }) => {
  return jsonOk(await meService.getProfile(user));
});

export const PATCH = authedRoute(async ({ request, user }) => {
  return jsonOk(
    await meService.updatePerson(user, await readJsonBody(request)),
    "Profile updated"
  );
});
