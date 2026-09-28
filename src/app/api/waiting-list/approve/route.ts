import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { waitingListService } from "@/services/waiting-list/waiting-list.service";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ request }) => {
  const result = await waitingListService.approve(await readJsonBody(request));
  return jsonOk(result);
});
