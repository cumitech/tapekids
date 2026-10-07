import { z } from "zod";

export const YF_ID_MAX_LENGTH = 32;

/** Young Foundations membership numbers, e.g. `2790694`. */
export function normalizeYfId(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[\s-]+/g, "");
}

export function normalizeYfIdOrNull(value: unknown): string | null {
  return normalizeYfId(value) || null;
}

export function yfIdsMatch(left: unknown, right: unknown): boolean {
  const a = normalizeYfId(left);
  const b = normalizeYfId(right);
  return Boolean(a) && a.toLowerCase() === b.toLowerCase();
}

export const requiredYfIdSchema = z
  .string()
  .trim()
  .min(1, "YF ID is required")
  .max(YF_ID_MAX_LENGTH)
  .transform((value) => normalizeYfId(value))
  .refine((value) => value.length > 0, "YF ID is required");

export const optionalYfIdSchema = z
  .string()
  .trim()
  .max(YF_ID_MAX_LENGTH)
  .optional()
  .transform((value) => (value ? normalizeYfId(value) : ""));

export function yfGuestHandle(person: {
  id: string;
  yfId?: string | null;
}): string {
  return normalizeYfId(person.yfId) || person.id;
}

/** Account address. The family's contact email stays on the person and may be shared. */
export function yfGuestEmail(person: {
  id: string;
  yfId?: string | null;
}): string {
  return `yf.${yfGuestHandle(person)}@guest.kids-event.cm`;
}
