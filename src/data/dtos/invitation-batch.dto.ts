import { DEFAULT_LOCALE } from "@/constants/locales";
import { z } from "zod";

import { membershipKindSchema } from "@/data/dtos/event-participation.dto";
import { isEmptyHtml } from "@/lib/html";

export const createInvitationBatchSchema = z
  .object({
    mailingListId: z.string().trim().min(1).optional().nullable(),
    personIds: z.array(z.string().trim().min(1)).optional(),
    kind: membershipKindSchema.optional(),
    subject: z.string().trim().min(1).max(255).optional(),
    body: z.string().trim().min(1).optional(),
    translations: z
      .object({
        en: z
          .object({
            subject: z.string().max(255).optional(),
            body: z.string().optional(),
          })
          .optional(),
        fr: z
          .object({
            subject: z.string().max(255).optional(),
            body: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .refine(
    (value) =>
      Boolean(value.mailingListId) || (value.personIds?.length ?? 0) > 0,
    {
      message: "Provide a mailing list or at least one person id.",
    }
  )
  .superRefine((value, ctx) => {
    const subject =
      value.translations?.[DEFAULT_LOCALE]?.subject?.trim() || value.subject?.trim();
    const body =
      value.translations?.[DEFAULT_LOCALE]?.body?.trim() || value.body?.trim();
    if (!subject) {
      ctx.addIssue({
        code: "custom",
        path: ["subject"],
        message: "Subject is required",
      });
    }
    if (!body || isEmptyHtml(body)) {
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message: "Body is required",
      });
    }
  });

export type CreateInvitationBatch = z.infer<typeof createInvitationBatchSchema>;

export function parseCreateInvitationBatch(body: unknown): CreateInvitationBatch {
  return createInvitationBatchSchema.parse(body);
}
