import { jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = publicRoute(async () => {
  const events = await eventService.listPublished();
  return jsonOk(events);
});
