import type { AxiosError } from "axios";

export function campayErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<unknown>;
  const data = axiosError.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data.trim().slice(0, 400);
  }
  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => String(item)).join(" ").slice(0, 400);
  }
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const candidates = [
      record.message,
      record.error,
      record.detail,
      record.code,
      record.non_field_errors,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate.map((item) => String(item)).join(" ").slice(0, 400);
      }
    }
    try {
      return JSON.stringify(data).slice(0, 400);
    } catch {
      // ignore circular bodies
    }
  }
  return error instanceof Error ? error.message : "CamPay request failed.";
}
