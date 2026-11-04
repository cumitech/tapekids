import { jsonOk } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const POST = adminRoute<{ id: string }>(async ({ params }) =>
  jsonOk(
    await invitationService.retryFailed(params.id),
    "Failed invitations retried"
  )
);
