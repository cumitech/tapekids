import { jsonOk } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { trophyService } from "@/services/trophy/trophy.service";

export const runtime = "nodejs";

export const GET = adminRoute(async () =>
  jsonOk(await trophyService.stats())
);
