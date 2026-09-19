export function safeInternalPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[a-z]+:/i.test(value)) {
    return fallback;
  }
  return value;
}
