import { createHash, randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

export type RequestLogContext = {
  requestId: string;
  method: string;
  path: string;
  ip?: string;
  userId?: string;
  locale?: string;
};

const storage = new AsyncLocalStorage<RequestLogContext>();

export function newRequestId(): string {
  return randomUUID();
}

export function runWithRequestContext<T>(
  context: RequestLogContext,
  fn: () => T
): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestLogContext | undefined {
  return storage.getStore();
}

export function clientIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function requestPath(request: Request): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return request.url;
  }
}
