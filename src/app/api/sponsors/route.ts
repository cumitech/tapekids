import { parseListQuery } from "@/data/types/pagination";
import { jsonList, jsonOk } from "@/lib/api/http";
import {
  adminRoute,
  publicRoute,
  readJsonBody,
  searchParamsOf,
} from "@/lib/api/route-handler";
import { sponsorService } from "@/services/sponsors/sponsor.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const result = await sponsorService.list(parseListQuery(searchParamsOf(request)));
  return jsonList(result.data, result.total);
});

export const POST = publicRoute(async ({ request }) => {
  const result = await sponsorService.register(await readJsonBody(request));
  return jsonOk(result, "Sponsorship started", 201);
});
