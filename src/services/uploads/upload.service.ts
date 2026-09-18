import { LocalPublicStorageAdapter } from "@/adapters/storage/local-public.adapter";
import {
  EVENT_IMAGE_MAX_BYTES,
  EVENT_IMAGE_TYPES,
  EVENT_UPLOAD_FOLDER,
} from "@/constants/uploads";
import { ValidationException } from "@/exceptions/validation.exception";
import { nanoid } from "@/lib/api/id";

const storage = new LocalPublicStorageAdapter(EVENT_UPLOAD_FOLDER);

export class UploadService {
  async saveEventImage(file: File): Promise<{ url: string }> {
    const extension = EVENT_IMAGE_TYPES[file.type];
    if (!extension) {
      throw new ValidationException(
        "Upload a JPG, PNG, WEBP, GIF, or SVG image."
      );
    }
    if (file.size <= 0 || file.size > EVENT_IMAGE_MAX_BYTES) {
      throw new ValidationException("Image must be 5 MB or smaller.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storage.save(`${nanoid()}.${extension}`, buffer);
    return { url };
  }
}

export const uploadService = new UploadService();
