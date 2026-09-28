export function mutationRecord<T extends { id?: unknown }>(
  response: unknown
): T | undefined {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  const wrapped = (response as { data?: unknown }).data;
  const candidate =
    wrapped && typeof wrapped === "object" && "id" in wrapped
      ? (wrapped as T)
      : (response as T);

  return typeof candidate.id === "string" && candidate.id
    ? candidate
    : undefined;
}
