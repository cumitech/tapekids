import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) => {
  return jsonOk(
    await invitationService.resendSelected(params.id, await readJsonBody(request)),
    "Invitations resent"
  );
});
