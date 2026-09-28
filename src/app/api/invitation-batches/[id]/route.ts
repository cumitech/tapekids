import { NextResponse } from "next/server";

import { adminRoute } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await invitationService.getBatch(params.id));
});
