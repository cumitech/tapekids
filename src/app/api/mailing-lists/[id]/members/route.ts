import { NextResponse } from "next/server";

import { readJsonBody, adminRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await mailingListService.listMembers(params.id));
});

export const POST = adminRoute<{ id: string }>(async ({ request, params }) => {
  const member = await mailingListService.addMember(
    params.id,
    await readJsonBody(request)
  );
  return NextResponse.json(member, { status: 201 });
});
