import { isPersonCategory } from "@/constants/person";
import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ request }) => {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    throw new ValidationException("Choose people to delete.");
  }

  const record = body as { ids?: unknown; category?: unknown; all?: unknown };
  if (!isPersonCategory(record.category)) {
    throw new ValidationException("Choose a valid person category.");
  }

  const ids = Array.isArray(record.ids)
    ? record.ids.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    : undefined;

  return jsonOk(
    await personService.deleteMany({
      category: record.category,
      all: record.all === true,
      ids,
    }),
    "People deleted"
  );
});
