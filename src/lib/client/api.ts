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
  const { data } = await http.post(path, body);
  return unwrapEnvelope<T>(data);
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || fallback;
}
