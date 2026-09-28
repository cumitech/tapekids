import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { eventJoinService } from "@/services/events/event-join.service";

export const runtime = "nodejs";

export const GET = adminRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await eventJoinService.linkFor(params.id));
});

export const POST = adminRoute<{ id: string }>(async ({ params, request }) => {
  return jsonOk(
    await eventJoinService.generate(params.id, await readJsonBody(request))
  );
});
