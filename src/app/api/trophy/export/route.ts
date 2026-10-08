import { xlsxAttachment } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { trophyService } from "@/services/trophy/trophy.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  const { buffer, filename } = await trophyService.exportWorkbook();
  return xlsxAttachment(buffer, filename);
});
