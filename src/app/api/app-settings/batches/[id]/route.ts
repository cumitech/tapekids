import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { appSettingService } from "@/services/app-settings/app-setting.service";

export const runtime = "nodejs";

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  const body = await readJsonBody(request);
  const record =
    body && typeof body === "object"
      ? (body as { open?: unknown; extend?: unknown })
      : {};
  if (record.extend === true) {
    return jsonOk(
      await appSettingService.extendBatch(params.id),
      "Invitation batch extended"
    );
  }
  if (typeof record.open !== "boolean") {
    throw new ValidationException("open must be a boolean.");
  }
  const result = await appSettingService.setBatchLinksOpen(params.id, record.open);
  return jsonOk(
    result,
    record.open ? "Invitation batch reopened" : "Invitation batch closed"
  );
});
