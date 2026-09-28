import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { readJsonBody, searchParamsOf, adminRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await mailingListService.list(
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});

export const POST = adminRoute(async ({ request, user }) => {
  const list = await mailingListService.create(
    await readJsonBody(request),
    user.id
  );
  return NextResponse.json(list, { status: 201 });
});
