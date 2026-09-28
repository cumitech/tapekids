export const PUBLIC_UPLOAD_ROOT = "uploads";

export const EVENT_UPLOAD_FOLDER = "events";

export const EVENT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Client-side compression kicks in above this size to avoid proxy 413s. */
export const EVENT_IMAGE_COMPRESS_ABOVE_BYTES = 1024 * 1024;

export const EVENT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
