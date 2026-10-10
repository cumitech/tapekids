import type { PersonCategory } from "@/constants/person";
import { isPersonCategory } from "@/constants/person";
import { jsonOk } from "@/lib/api/http";
import { localeFromRequest } from "@/lib/api/request-locale";
import { adminRoute, searchParamsOf } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const params = searchParamsOf(request);
  const rawCategory = params.get("category");
  const category: PersonCategory | undefined =
    rawCategory && isPersonCategory(rawCategory) ? rawCategory : undefined;
  const locale = localeFromRequest(request);
  const batches = await personService.listImportBatches(category, locale);
  return jsonOk(batches);
});
