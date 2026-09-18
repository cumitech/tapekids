import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import {
  readJsonBody,
  searchParamsOf,
  staffRoute,
} from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = staffRoute(async ({ request }) => {
  const result = await eventService.list(parseListQuery(searchParamsOf(request)));
  return jsonList(result.data, result.total);
});

export const POST = staffRoute(async ({ request, user }) => {
  const event = await eventService.create(await readJsonBody(request), user.id);
  return NextResponse.json(event, { status: 201 });
});
