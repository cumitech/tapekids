import { NextResponse } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { readJsonBody, staffRoute } from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await eventService.getById(params.id));
});

export const PATCH = staffRoute<{ id: string }>(async ({ request, params }) => {
  const event = await eventService.update(params.id, await readJsonBody(request));
  return NextResponse.json(event);
});

export const DELETE = staffRoute<{ id: string }>(async ({ params }) => {
  await eventService.delete(params.id);
  return jsonOk(null, "Event deleted");
});
