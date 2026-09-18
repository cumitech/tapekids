import { z } from "zod";

import { DEFAULT_COUNTRY } from "@/constants/geo";
import { PERSON_GENDERS } from "@/constants/person";
import { nanoid } from "@/lib/api/id";
import { normalizeStoredPhone } from "@/lib/phone";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null);

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1).max(128),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .transform((value) => normalizeStoredPhone(value) ?? value),
  relation: z.string().trim().min(1).max(50).default("guardian"),
});

export const createPersonSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().toLowerCase(),
  phone: optionalText,
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z
    .enum(PERSON_GENDERS)
    .or(z.literal(""))
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  address: optionalText,
  churchName: optionalText,
  churchPastorName: optionalText,
  churchAddress: optionalText,
  country: optionalText,
  town: optionalText,
  region: optionalText,
  division: optionalText,
  subDivision: optionalText,
  parentGuardianName: optionalText,
  parentGuardianPhone: optionalText,
  medicalNotes: optionalText,
  emergencyContacts: z.array(emergencyContactSchema).max(3).optional(),
});

export const updatePersonSchema = createPersonSchema.partial();

export type CreatePerson = z.infer<typeof createPersonSchema>;
export type UpdatePerson = z.infer<typeof updatePersonSchema>;

function dateOnly(value: Date | null | undefined): Date | null {
  return value ?? null;
}

export function parseCreatePerson(body: unknown): CreatePerson {
  return createPersonSchema.parse(body);
}

export function parseUpdatePerson(body: unknown): UpdatePerson {
  return updatePersonSchema.parse(body);
}

export function toCreatePersonPayload(input: CreatePerson) {
  return {
    id: nanoid(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: normalizeStoredPhone(input.phone),
    dateOfBirth: dateOnly(input.dateOfBirth),
    gender: input.gender ?? null,
    address: input.address ?? null,
    churchName: input.churchName ?? null,
    churchPastorName: input.churchPastorName ?? null,
    churchAddress: input.churchAddress ?? null,
    country: DEFAULT_COUNTRY,
    town: input.town ?? null,
    region: input.region ?? null,
    division: input.division ?? null,
    subDivision: input.subDivision ?? null,
    parentGuardianName: input.parentGuardianName ?? null,
    parentGuardianPhone: normalizeStoredPhone(input.parentGuardianPhone),
    medicalNotes: input.medicalNotes ?? null,
  };
}

export function toUpdatePersonPayload(input: UpdatePerson) {
  const payload: Record<string, unknown> = {};

  if (input.firstName !== undefined) payload.firstName = input.firstName;
  if (input.lastName !== undefined) payload.lastName = input.lastName;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = normalizeStoredPhone(input.phone);
  if (input.dateOfBirth !== undefined) payload.dateOfBirth = dateOnly(input.dateOfBirth);
  if (input.gender !== undefined) payload.gender = input.gender;
  if (input.address !== undefined) payload.address = input.address;
  if (input.churchName !== undefined) payload.churchName = input.churchName;
  if (input.churchPastorName !== undefined) {
    payload.churchPastorName = input.churchPastorName;
  }
  if (input.churchAddress !== undefined) {
    payload.churchAddress = input.churchAddress;
  }
  if (input.country !== undefined) payload.country = DEFAULT_COUNTRY;
  if (input.town !== undefined) payload.town = input.town;
  if (input.region !== undefined) payload.region = input.region;
  if (input.division !== undefined) payload.division = input.division;
  if (input.subDivision !== undefined) payload.subDivision = input.subDivision;
  if (input.parentGuardianName !== undefined) {
    payload.parentGuardianName = input.parentGuardianName;
  }
  if (input.parentGuardianPhone !== undefined) {
    payload.parentGuardianPhone = normalizeStoredPhone(input.parentGuardianPhone);
  }
  if (input.medicalNotes !== undefined) payload.medicalNotes = input.medicalNotes;

  return payload;
}
