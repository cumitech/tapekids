import { LOCALES } from "@/constants/locales";
import type { MailingListFormValues } from "@/types/forms";

export interface MailingList {
  id: string;
  name: string;
  description?: string | null;
  audienceKind: "camper" | "coordinator" | "sponsor" | "mixed";
  translations?: Partial<
    Record<"en" | "fr", Partial<{ name: string; description: string }>>
  >;
  members?: Array<{
    id: string;
    personId: string;
    person?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
    };
  }>;
}

export const emptyMailingListForm: MailingListFormValues = {
  translations: {
    en: { name: "", description: "" },
    fr: { name: "", description: "" },
  },
  audienceKind: "mixed",
  personIds: [],
};

export function mailingListToFormValues(
  record?: MailingList | null
): MailingListFormValues {
  return {
    translations: {
      en: {
        name: record?.translations?.en?.name || record?.name || "",
        description:
          record?.translations?.en?.description || record?.description || "",
      },
      fr: {
        name: record?.translations?.fr?.name || "",
        description: record?.translations?.fr?.description || "",
      },
    },
    audienceKind: record?.audienceKind ?? "mixed",
    personIds: record?.members?.map((member) => member.personId) ?? [],
  };
}

export function mailingListFormToPayload(values: MailingListFormValues) {
  return {
    audienceKind: values.audienceKind,
    personIds: values.personIds,
    translations: Object.fromEntries(
      LOCALES.map((locale) => [locale, values.translations[locale]])
    ),
  };
}
