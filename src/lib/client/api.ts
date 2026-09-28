import type { AxiosError } from "axios";

import { http } from "@/utils/axios";

type Envelope<T> = {
  data?: T;
  message?: string;
};

export function unwrapEnvelope<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as Envelope<T>).data;
    if (data !== undefined) {
      return data;
    }
  }
  return payload as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const { data } = await http.get(path);
  return unwrapEnvelope<T>(data);
}

function filenameFromDisposition(header: unknown, fallback: string) {
  const value = String(header ?? "");
  const utf = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf?.[1]) {
    return decodeURIComponent(utf[1]);
  }
  const quoted = value.match(/filename="([^"]+)"/i);
  if (quoted?.[1]) {
    return quoted[1];
  }
  const plain = value.match(/filename=([^;]+)/i);
  return plain?.[1]?.trim() || fallback;
}

async function blobErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<Blob>;
  const payload = axiosError.response?.data;
  if (payload instanceof Blob) {
    try {
      const parsed = JSON.parse(await payload.text()) as { message?: string };
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // Fall through to the generic Axios message.
    }
  }
  return apiErrorMessage(error, fallback);
}

export async function apiDownload(path: string, fallbackName: string) {
  try {
    const response = await http.get<Blob>(path, { responseType: "blob" });
    const filename = filenameFromDisposition(
      response.headers["content-disposition"],
      fallbackName
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(await blobErrorMessage(error, fallbackName));
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await http.post(path, body);
  return unwrapEnvelope<T>(data);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const { data } = await http.patch(path, body);
  return unwrapEnvelope<T>(data);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await http.delete(path);
  return unwrapEnvelope<T>(data);
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const body = new FormData();
  body.append("file", file);
  return apiUploadForm<T>(path, body);
}

export async function apiUploadForm<T>(
  path: string,
  body: FormData,
  options?: { timeout?: number }
): Promise<T> {
  const { data } = await http.post(path, body, {
    timeout: options?.timeout,
  });
  return unwrapEnvelope<T>(data);
}

export function isNetworkError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return Boolean(axiosError.isAxiosError && !axiosError.response);
}

export function isRetryableHttpError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  if (!axiosError.isAxiosError) {
    return false;
  }
  if (!axiosError.response) {
    return true;
  }
  const status = axiosError.response.status;
  return status === 408 || status === 429 || status >= 500;
}

export async function withHttpRetry<T>(
  run: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isRetryableHttpError(error) || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, 400 * 2 ** (attempt - 1))
      );
    }
  }
  throw lastError;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}
