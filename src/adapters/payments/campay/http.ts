import axios, { type AxiosError } from "axios";

import { campayConfig } from "@/lib/integrations/campay.config";
import { logger } from "@/lib/logger";
import { campayErrorMessage } from "./errors";
import { getCampayAccessToken, invalidateCampayToken, campayTokenSource } from "./token";

const TIMEOUT_MS = 15_000;

export function campayUrl(path: string): string {
  const root = campayConfig().apiRoot;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${root}${suffix}`;
}

export async function campayRequest<T>(
  method: "get" | "post",
  path: string,
  options: { body?: unknown; params?: unknown; isRetry?: boolean } = {}
): Promise<T> {
  const token = await getCampayAccessToken({
    forceRefresh: Boolean(options.isRetry && campayTokenSource() === "static"),
  });

  try {
    const response = await axios({
      method,
      url: campayUrl(path),
      data: options.body,
      params: options.params,
      timeout: TIMEOUT_MS,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as T;
  } catch (error) {
    const status = (error as AxiosError).response?.status;
    if (status === 401 && !options.isRetry) {
      invalidateCampayToken();
      return campayRequest<T>(method, path, { ...options, isRetry: true });
    }
    const message = campayErrorMessage(error);
    logger.error("campay.request_failed", {
      method,
      path,
      status,
      message,
    });
    throw new Error(message);
  }
}
