import { jsonOk } from "@/lib/api/http";
import { staffRoute } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const POST = staffRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await invitationService.sendBatch(params.id), "Invitations sent");
});
