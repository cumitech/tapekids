import { jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { sponsorService } from "@/services/sponsors/sponsor.service";

export const runtime = "nodejs";

export const POST = publicRoute<{ id: string }>(async ({ params }) => {
  return jsonOk(await sponsorService.refresh(params.id));
});
