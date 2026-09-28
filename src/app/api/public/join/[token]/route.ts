import { jsonOk } from "@/lib/api/http";
import { publicRoute, readJsonBody } from "@/lib/api/route-handler";
import { eventJoinService } from "@/services/events/event-join.service";

export const runtime = "nodejs";

export const GET = publicRoute<{ token: string }>(async ({ params }) => {
  return jsonOk(await eventJoinService.preview(params.token));
});

export const POST = publicRoute<{ token: string }>(async ({ params, request }) => {
  return jsonOk(
    await eventJoinService.enter(params.token, await readJsonBody(request))
  );
});
