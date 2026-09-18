import { parseListQuery } from "@/data/types/pagination";
import { jsonList, jsonOk } from "@/lib/api/http";
import {
  readJsonBody,
  searchParamsOf,
  staffRoute,
} from "@/lib/api/route-handler";
import { invitationService } from "@/services/invitations/invitation.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ request, params }) => {
  const result = await invitationService.listByEvent(
    params.id,
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});

export const POST = staffRoute<{ id: string }>(async ({ request, params, user }) => {
  const queued = await invitationService.queue(
    params.id,
    await readJsonBody(request),
    user.id
  );
  return jsonOk(queued, "Invitations queued", 201);
});
