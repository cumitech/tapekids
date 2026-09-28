import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import {
  readJsonBody,
  searchParamsOf,
  adminRoute,
} from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await eventService.list(parseListQuery(searchParamsOf(request)));
  return jsonList(result.data, result.total);
});

export const POST = adminRoute(async ({ request, user }) => {
  const event = await eventService.create(await readJsonBody(request), user.id);
  return NextResponse.json(event, { status: 201 });
});
