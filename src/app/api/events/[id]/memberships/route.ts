import { jsonList } from "@/lib/api/http";
import { staffRoute } from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  const rows = await eventService.listMemberships(params.id);
  return jsonList(rows, rows.length);
});
