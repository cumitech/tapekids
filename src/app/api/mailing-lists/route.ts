import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { readJsonBody, searchParamsOf, staffRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const GET = staffRoute(async ({ request }) => {
  const result = await mailingListService.list(
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});

export const POST = staffRoute(async ({ request, user }) => {
  const list = await mailingListService.create(
    await readJsonBody(request),
    user.id
  );
  return NextResponse.json(list, { status: 201 });
});
