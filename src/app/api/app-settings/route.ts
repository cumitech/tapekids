import { APP_SETTING_CATALOG } from "@/constants/app-settings";
import { ValidationException } from "@/exceptions/validation.exception";
import { jsonOk } from "@/lib/api/http";
import { adminRoute, readJsonBody } from "@/lib/api/route-handler";
import { appSettingService } from "@/services/app-settings/app-setting.service";

export const runtime = "nodejs";

export const GET = adminRoute(async () => {
  return jsonOk(await appSettingService.page());
});

export const PATCH = adminRoute(async ({ request }) => {
  const body = await readJsonBody(request);
  const record =
    body && typeof body === "object" ? (body as { key?: unknown; open?: unknown }) : {};
  const key = typeof record.key === "string" ? record.key : "";
  if (
    !APP_SETTING_CATALOG.some((item) => item.key === key && item.type === "boolean") ||
    typeof record.open !== "boolean"
  ) {
    throw new ValidationException("A known boolean setting and open flag are required.");
  }
  const result = await appSettingService.setBoolean(key, record.open);
  return jsonOk(result, record.open ? "Setting opened" : "Setting closed");
});
