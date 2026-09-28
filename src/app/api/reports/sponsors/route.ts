import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { adminRoute, searchParamsOf } from "@/lib/api/route-handler";
import { reportService } from "@/services/reports/report.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await reportService.listSponsors(
    parseListQuery(searchParamsOf(request))
  );
  return jsonList(result.data, result.total);
});
