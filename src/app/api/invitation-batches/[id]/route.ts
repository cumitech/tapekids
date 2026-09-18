import { NextResponse } from "next/server";

import { staffRoute } from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await invitationService.getBatch(params.id));
});
