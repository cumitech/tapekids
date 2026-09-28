import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const PATCH = adminRoute(async ({ request }) => {
  const body = await readJsonBody(request);
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { open?: unknown }).open !== "boolean"
  ) {
    throw new ValidationException("open must be a boolean.");
  }
  const { invitationLinksOpen } = await invitationService.setLinksOpen(
    (body as { open: boolean }).open
  );
  return jsonOk(
    { invitationLinksOpen },
    invitationLinksOpen
      ? "Invitation links reopened"
      : "Invitation links closed"
  );
});
