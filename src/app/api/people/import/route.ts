import { isPersonCategory } from "@/constants/person";
import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ request }) => {
  const form = await request.formData();
  const category = form.get("category");
  const file = form.get("file");

  if (!isPersonCategory(category)) {
    throw new ValidationException("Choose a valid person category for this import.");
  }
  if (!(file instanceof File)) {
    throw new ValidationException("Upload an Excel (.xlsx) file.");
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    throw new ValidationException("Only Excel files (.xlsx, .xls) are supported.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return jsonOk(
    await personService.importFromWorkbook(buffer, category),
    "People imported"
  );
});
