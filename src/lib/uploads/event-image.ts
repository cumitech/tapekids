import {
  EVENT_UPLOAD_FOLDER,
  PUBLIC_UPLOAD_ROOT,
} from "@/constants/uploads";

export function eventUploadPublicPath(filename: string): string {
  return `/${PUBLIC_UPLOAD_ROOT}/${EVENT_UPLOAD_FOLDER}/${filename}`;
}

export function eventImageSrc(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  let trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  trimmed = trimmed.replace(/^\/(en|fr)(?=\/)/i, "");

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith(`/${PUBLIC_UPLOAD_ROOT}/${EVENT_UPLOAD_FOLDER}/`)) {
    return trimmed;
  }

  if (trimmed.startsWith(`${PUBLIC_UPLOAD_ROOT}/${EVENT_UPLOAD_FOLDER}/`)) {
    return `/${trimmed}`;
  }

  return eventUploadPublicPath(trimmed.replace(/^\/+/, ""));
}
