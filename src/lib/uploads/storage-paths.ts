import { access } from "node:fs/promises";
import path from "node:path";

import {
  EVENT_IMAGE_TYPES,
  EVENT_UPLOAD_FOLDER,
  PUBLIC_UPLOAD_ROOT,
} from "@/constants/uploads";

const SAFE_EVENT_IMAGE = /^[A-Za-z0-9._-]+$/;

const MIME_BY_EXTENSION = Object.fromEntries(
  Object.entries(EVENT_IMAGE_TYPES).map(([mime, extension]) => [extension, mime])
) as Record<string, string>;

export function isSafeEventImageName(filename: string): boolean {
  return SAFE_EVENT_IMAGE.test(filename) && !filename.includes("..");
}

export function eventImageMime(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

export function writableUploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.resolve(expandHomeDir(configured));
  }
  return path.join(process.cwd(), "data", PUBLIC_UPLOAD_ROOT);
}

function expandHomeDir(value: string) {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    return value;
  }
  if (value === "~") {
    return home;
  }
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(home, value.slice(2));
  }
  if (value.startsWith("$HOME/") || value.startsWith("$HOME\\")) {
    return path.join(home, value.slice(6));
  }
  return value;
}

export function eventUploadDir(): string {
  return path.join(writableUploadRoot(), EVENT_UPLOAD_FOLDER);
}

export function publicEventUploadDir(): string {
  return path.join(process.cwd(), "public", PUBLIC_UPLOAD_ROOT, EVENT_UPLOAD_FOLDER);
}

export async function resolveEventImagePath(
  filename: string
): Promise<string | null> {
  if (!isSafeEventImageName(filename)) {
    return null;
  }

  const candidates = [
    path.join(eventUploadDir(), filename),
    path.join(publicEventUploadDir(), filename),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}
