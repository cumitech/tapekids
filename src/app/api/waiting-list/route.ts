import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import {
  adminRoute,
  publicRoute,
  readJsonBody,
  searchParamsOf,
} from "@/lib/api/route-handler";
import { waitingListService } from "@/services/waiting-list/waiting-list.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await waitingListService.list(
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});

export const POST = publicRoute(async ({ request }) => {
  const entry = await waitingListService.register(await readJsonBody(request));
  return NextResponse.json(entry, { status: 201 });
});
