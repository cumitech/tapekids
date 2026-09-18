import { jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { eventService } from "@/services/events/event.service";

export const runtime = "nodejs";

export const GET = publicRoute<{ slug: string }>(async ({ params }) => {
  return jsonOk(await eventService.getPublishedBySlug(params.slug));
});
