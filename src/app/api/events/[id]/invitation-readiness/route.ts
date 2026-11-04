import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) =>
  jsonOk(
    await invitationService.invitationReadiness(
      params.id,
      await readJsonBody(request)
    )
  )
);
