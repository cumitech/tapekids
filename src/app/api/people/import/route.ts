import { isPersonCategory } from "@/constants/person";
import { formatDateTime } from "@/lib/format";
import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { localeFromRequest } from "@/lib/api/request-locale";
import { adminRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const POST = adminRoute(async ({ request, user }) => {
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
  const { result, newPersonIds } = await personService.importFromWorkbook(
    buffer,
    category
  );
  const importBatchId = await personService.recordImportHistory({
    category,
    importedAt: result.importedAt ?? new Date().toISOString(),
    fileName: file.name,
    result,
    mailingListId: null,
  });
  let mailingList: {
    id: string;
    name: string;
    memberCount: number;
  } | null = null;

  if (newPersonIds.length > 0) {
    const date = result.importedAt ?? new Date().toISOString();
    const categoryName =
      category === "trophy_participant"
        ? { en: "Trophy Participants", fr: "Participants Trophy" }
        : { en: "Trophy Campers", fr: "Campeurs Trophy" };
    const englishName = `${categoryName.en} import — ${formatDateTime(
      date,
      "en"
    )}`;
    const frenchName = `Import ${categoryName.fr} — ${formatDateTime(
      date,
      "fr"
    )}`;
    const locale = localeFromRequest(request);
    const createdList = await mailingListService.create(
      {
        name: locale === "fr" ? frenchName : englishName,
        audienceKind: category,
        personIds: newPersonIds,
        translations: {
          en: { name: englishName },
          fr: { name: frenchName },
        },
      },
      user.id
    );
    mailingList = {
      id: createdList.id,
      name: createdList.name,
      memberCount: newPersonIds.length,
    };
    await personService.attachImportMailingList(importBatchId, createdList.id);
  }

  return jsonOk({ ...result, mailingList, importBatchId }, "People imported");
});
