import { isPersonCategory, type PersonCategory } from "@/constants/person";
import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute, searchParamsOf } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const rawCategory = searchParamsOf(request).get("category");
  if (rawCategory && !isPersonCategory(rawCategory)) {
    throw new ValidationException("Choose a valid person category.");
  }
  const category = rawCategory as PersonCategory | null;
  return jsonOk(await personService.listImportHistory(category ?? undefined));
});
