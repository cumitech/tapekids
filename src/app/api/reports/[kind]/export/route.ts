import { xlsxAttachment } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { reportService } from "@/services/reports/report.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = adminRoute<{ kind: string }>(async ({ params }) => {
  const { buffer, filename } = await reportService.exportWorkbook(params.kind);
  return xlsxAttachment(buffer, filename);
});
