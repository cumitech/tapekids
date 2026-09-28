import { z } from "zod";

import { DEFAULT_COUNTRY } from "@/constants/geo";
import {
  PERSON_CATEGORY_VALUES,
  PERSON_GENDERS,
  SHIRT_SIZES,
  canonicalShirtSize,
  type PersonCategory,
} from "@/constants/person";
import { nanoid } from "@/lib/api/id";
import { isStandardEmail, normalizeEmail } from "@/lib/email";
import { normalizeYfIdOrNull } from "@/lib/people/yf-id";
import { ageInYears } from "@/lib/people/age";
import { normalizeStoredPhone } from "@/lib/phone";

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => value || null);

const optionalEmail = z
  .union([z.string(), z.literal(""), z.null()])
  .optional()
  .transform((value, ctx) => {
    const email = normalizeEmail(value);
    if (!email) {
      return null;
    }
    if (!isStandardEmail(email, 128)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid email: ${email}`,
      });
      return z.NEVER;
    }
    return email;
  });

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
  fullName: z.string().trim().min(1).max(160),
  email: optionalEmail,
  phone: optionalText,
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z
    .enum(PERSON_GENDERS)
    .or(z.literal(""))
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  shirtSize: z.preprocess(
    (value) => canonicalShirtSize(value),
    z
      .enum(SHIRT_SIZES)
      .or(z.literal(""))
      .optional()
      .nullable()
      .transform((value) => (value ? value : null)),
  ),
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
  yfId: optionalText.transform((value) => normalizeYfIdOrNull(value)),
  points: z.coerce.number().int().nullable().optional(),
  ageYears: z.coerce.number().int().min(0).max(120).nullable().optional(),
  isTrophy: z.boolean().optional(),
  category: z
    .enum(PERSON_CATEGORY_VALUES as [PersonCategory, ...PersonCategory[]])
    .or(z.literal(""))
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
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
    fullName: input.fullName,
    email: input.email ?? null,
    phone: normalizeStoredPhone(input.phone),
    dateOfBirth: dateOnly(input.dateOfBirth),
    gender: input.gender ?? null,
    shirtSize: input.shirtSize ?? null,
    address: input.address ?? null,
    churchName: input.churchName ?? null,
    churchPastorName: input.churchPastorName ?? null,
    churchAddress: input.churchAddress ?? null,
    country: input.country || DEFAULT_COUNTRY,
    town: input.town ?? null,
    region: input.region ?? null,
    division: input.division ?? null,
    subDivision: input.subDivision ?? null,
    parentGuardianName: input.parentGuardianName ?? null,
    parentGuardianPhone: normalizeStoredPhone(input.parentGuardianPhone),
    medicalNotes: input.medicalNotes ?? null,
    yfId: input.yfId ?? null,
    points: input.points ?? null,
    ageYears: ageInYears(input.dateOfBirth),
    isTrophy: input.isTrophy ?? false,
    category: input.category ?? null,
  };
}

export function toUpdatePersonPayload(input: UpdatePerson) {
  const payload: Record<string, unknown> = {};

  if (input.fullName !== undefined) payload.fullName = input.fullName;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = normalizeStoredPhone(input.phone);
  if (input.dateOfBirth !== undefined) {
    payload.dateOfBirth = dateOnly(input.dateOfBirth);
    payload.ageYears = ageInYears(input.dateOfBirth);
  }
  if (input.gender !== undefined) payload.gender = input.gender;
  if (input.shirtSize !== undefined) payload.shirtSize = input.shirtSize;
  if (input.address !== undefined) payload.address = input.address;
  if (input.churchName !== undefined) payload.churchName = input.churchName;
  if (input.churchPastorName !== undefined) {
    payload.churchPastorName = input.churchPastorName;
  }
  if (input.churchAddress !== undefined) {
    payload.churchAddress = input.churchAddress;
  }
  if (input.country !== undefined) payload.country = input.country || DEFAULT_COUNTRY;
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
  if (input.yfId !== undefined) payload.yfId = input.yfId;
  if (input.points !== undefined) payload.points = input.points;
  if (input.isTrophy !== undefined) payload.isTrophy = input.isTrophy;
  if (input.category !== undefined) payload.category = input.category;

  return payload;
}

export const importPeopleSchema = z.object({
  category: z.enum(
    PERSON_CATEGORY_VALUES as [PersonCategory, ...PersonCategory[]]
  ),
  defaultCategory: z
    .enum(PERSON_CATEGORY_VALUES as [PersonCategory, ...PersonCategory[]])
    .optional(),
});

export function parseImportPeopleMeta(body: unknown) {
  return z
    .object({
      category: z.enum(
        PERSON_CATEGORY_VALUES as [PersonCategory, ...PersonCategory[]]
      ),
    })
    .parse(body);
}
