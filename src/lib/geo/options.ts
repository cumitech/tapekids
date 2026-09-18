import type { GeoOption } from "@/types/geo";

export function toGeoOptions(values: string[]): GeoOption[] {
  return values
    .filter((value) => value.trim().length > 0)
    .map((value) => ({ value, label: value }));
}

export function withCurrentOption(
  options: GeoOption[],
  current?: string | null
): GeoOption[] {
  const value = current?.trim();
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }
  return [{ value, label: value }, ...options];
}

export function normalizeGeoName(value: string): string {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}
