import { NextResponse } from "next/server";

import { readJsonBody, staffRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await mailingListService.listMembers(params.id));
});

export const POST = staffRoute<{ id: string }>(async ({ request, params }) => {
  const member = await mailingListService.addMember(
    params.id,
    await readJsonBody(request)
  );
  return NextResponse.json(member, { status: 201 });
});
