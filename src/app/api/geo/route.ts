import { jsonOk } from "@/lib/api/http";
import { publicRoute, searchParamsOf } from "@/lib/api/route-handler";
import { geoService } from "@/services/geo/geo.service";
import type { GeoKind } from "@/types/geo";

export const runtime = "nodejs";

const KINDS = new Set<GeoKind>([
  "regions",
  "cities",
  "divisions",
  "subdivisions",
]);

export const GET = publicRoute(
  async ({ request }) => {
    const params = searchParamsOf(request);
    const kind = params.get("kind") as GeoKind | null;
    if (!kind || !KINDS.has(kind)) {
      return jsonOk([], "Unknown geo kind", 400);
    }

    const data = await geoService.list(kind, {
      region: params.get("region") ?? undefined,
      division: params.get("division") ?? undefined,
    });
    return jsonOk(data);
  },
  { db: false }
);
