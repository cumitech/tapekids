export function errorName(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const named = error as { name?: string; constructor?: { name?: string } };
  if (typeof named.name === "string" && named.name && named.name !== "Error") {
    return named.name;
  }
  if (typeof named.constructor?.name === "string" && named.constructor.name !== "Object") {
    return named.constructor.name;
  }
  return undefined;
}

export function isNamedError(error: unknown, name: string): boolean {
  return errorName(error) === name;
}

const CLIENT_ERROR_NAMES = new Set([
  "UnauthorizedException",
  "ValidationException",
  "ForbiddenException",
  "ConflictException",
  "NotFoundException",
  "ZodError",
]);

export function isClientError(error: unknown): boolean {
  const name = errorName(error);
  if (name && CLIENT_ERROR_NAMES.has(name)) {
    return true;
  }
  const status = (error as { status?: number } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500;
}
