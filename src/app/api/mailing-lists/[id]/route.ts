import { NextResponse } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { readJsonBody, adminRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await mailingListService.getById(params.id));
});

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  const list = await mailingListService.update(
    params.id,
    await readJsonBody(request)
  );
  return NextResponse.json(list);
});

export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  await mailingListService.delete(params.id);
  return jsonOk(null, "Mailing list deleted");
});
