import { jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { normalizeInviteToken } from "@/lib/invitations/token";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const GET = publicRoute<{ token: string }>(async ({ params }) => {
  return jsonOk(
    await invitationService.getByToken(normalizeInviteToken(params.token))
  );
});

export const POST = publicRoute<{ token: string }>(async ({ request, params }) => {
  const body = await request.json().catch(() => ({}));
  return jsonOk(
    await invitationService.acceptByToken(
      normalizeInviteToken(params.token),
      body
    ),
    "Invitation accepted"
  );
});
