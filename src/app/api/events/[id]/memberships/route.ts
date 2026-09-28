import { jsonList } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  const rows = await eventService.listMemberships(params.id);
  return jsonList(rows, rows.length);
});
