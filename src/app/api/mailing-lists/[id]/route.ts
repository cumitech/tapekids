import { NextResponse } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { readJsonBody, staffRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await mailingListService.getById(params.id));
});

export const PATCH = staffRoute<{ id: string }>(async ({ request, params }) => {
  const list = await mailingListService.update(
    params.id,
    await readJsonBody(request)
  );
  return NextResponse.json(list);
});

export const DELETE = staffRoute<{ id: string }>(async ({ params }) => {
  await mailingListService.delete(params.id);
  return jsonOk(null, "Mailing list deleted");
});
