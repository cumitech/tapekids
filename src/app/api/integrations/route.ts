import { jsonOk } from "@/lib/api/http";
import { publicRoute } from "@/lib/api/route-handler";
import { publicIntegrations } from "@/lib/integrations/public";

export const runtime = "nodejs";

export const GET = publicRoute(async () => jsonOk(publicIntegrations()), {
  db: false,
});
