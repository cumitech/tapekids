import { jsonOk } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { dashboardService } from "@/services/dashboard/dashboard.service";

export const runtime = "nodejs";

export const GET = adminRoute(async () =>
  jsonOk(await dashboardService.stats())
);
