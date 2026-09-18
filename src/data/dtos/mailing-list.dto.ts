import { DEFAULT_LOCALE } from "@/constants/locales";
import { z } from "zod";

import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";
import { nanoid } from "@/lib/api/id";

const audienceKind = z.enum([
  MAILING_LIST_AUDIENCE_KINDS.CAMPER,
  MAILING_LIST_AUDIENCE_KINDS.COORDINATOR,
  MAILING_LIST_AUDIENCE_KINDS.SPONSOR,
  MAILING_LIST_AUDIENCE_KINDS.MIXED,
]);

const memberFiltersSchema = z
  .object({
    region: z.string().trim().min(1).optional(),
    division: z.string().trim().min(1).optional(),
    subDivision: z.string().trim().min(1).optional(),
    town: z.string().trim().min(1).optional(),
    churchName: z.string().trim().min(1).optional(),
    q: z.string().trim().min(1).optional(),
  })
  .optional();

const mailingListLocaleCopySchema = z.object({
  name: z.string().max(128).optional(),
  description: z.string().max(255).optional(),
});

export const mailingListBodySchema = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  description: z.string().trim().max(255).optional().nullable(),
  audienceKind: audienceKind.optional(),
  personIds: z.array(z.string().trim().min(1)).optional(),
  memberFilters: memberFiltersSchema,
  translations: z
    .object({
      en: mailingListLocaleCopySchema.optional(),
      fr: mailingListLocaleCopySchema.optional(),
    })
    .optional(),
});

export const createMailingListSchema = mailingListBodySchema.superRefine(
  (value, ctx) => {
    const name =
      value.translations?.[DEFAULT_LOCALE]?.name?.trim() || value.name?.trim();
    if (!name) {
      ctx.addIssue({ code: "custom", path: ["name"], message: "Name is required" });
    }
  }
);

export const updateMailingListSchema = mailingListBodySchema.partial();

export const addMailingListMemberSchema = z
  .object({
    personId: z.string().trim().min(1).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
  })
  .refine((value) => Boolean(value.personId || value.email), {
    message: "Provide a personId or email.",
  });

export type CreateMailingList = z.infer<typeof createMailingListSchema>;
export type UpdateMailingList = z.infer<typeof updateMailingListSchema>;
export type AddMailingListMember = z.infer<typeof addMailingListMemberSchema>;

export function parseCreateMailingList(body: unknown): CreateMailingList {
  return createMailingListSchema.parse(body);
}

export function parseUpdateMailingList(body: unknown): UpdateMailingList {
  return updateMailingListSchema.parse(body);
}

export function parseAddMailingListMember(body: unknown): AddMailingListMember {
  return addMailingListMemberSchema.parse(body);
}

export function toCreateMailingListPayload(
  input: CreateMailingList,
  createdById: string
) {
  return {
    id: nanoid(),
    name:
      input.translations?.[DEFAULT_LOCALE]?.name?.trim() || input.name || "",
    description:
      input.translations?.[DEFAULT_LOCALE]?.description?.trim() ||
      input.description ||
      null,
    audienceKind: input.audienceKind ?? MAILING_LIST_AUDIENCE_KINDS.MIXED,
    createdById,
  };
}

export function toUpdateMailingListPayload(input: UpdateMailingList) {
  const payload: {
    name?: string;
    description?: string | null;
    audienceKind?: CreateMailingList["audienceKind"];
  } = {};

  if (input.translations?.[DEFAULT_LOCALE]?.name || input.name !== undefined) {
    payload.name =
      input.translations?.[DEFAULT_LOCALE]?.name?.trim() || input.name;
  }
  if (
    input.translations?.[DEFAULT_LOCALE]?.description !== undefined ||
    input.description !== undefined
  ) {
    payload.description =
      input.translations?.[DEFAULT_LOCALE]?.description?.trim() ||
      input.description;
  }
  if (input.audienceKind !== undefined) payload.audienceKind = input.audienceKind;

  return payload;
}
