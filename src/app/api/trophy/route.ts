import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { adminRoute, searchParamsOf } from "@/lib/api/route-handler";
import { trophyService } from "@/services/trophy/trophy.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await trophyService.list(
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});
