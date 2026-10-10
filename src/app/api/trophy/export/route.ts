import { xlsxAttachment } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { localeFromRequest } from "@/lib/api/request-locale";
import { trophyService } from "@/services/trophy/trophy.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ request }) => {
  const { buffer, filename } = await trophyService.exportWorkbook(
    localeFromRequest(request)
  );
  return xlsxAttachment(buffer, filename);
});
