import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { searchParamsOf, adminRoute } from "@/lib/api/route-handler";
import { auditService } from "@/services/audit/audit.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await auditService.list(parseListQuery(searchParamsOf(request)));
  return jsonList(result.data, result.total);
});
