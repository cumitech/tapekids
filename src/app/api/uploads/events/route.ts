import { jsonOk } from "@/lib/api/http";
import { staffRoute } from "@/lib/api/route-handler";
import { ValidationException } from "@/exceptions/validation.exception";
import { uploadService } from "@/services/uploads/upload.service";

export const runtime = "nodejs";

export const POST = staffRoute(async ({ request }) => {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new ValidationException("Choose an image to upload.");
  }

  return jsonOk(await uploadService.saveEventImage(file), "Image uploaded", 201);
});
