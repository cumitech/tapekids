import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  return jsonOk(
    await invitationService.updateRecipientEmail(
      params.id,
      await readJsonBody(request)
    ),
    "Email updated"
  );
});
