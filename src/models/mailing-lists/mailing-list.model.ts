import { CONTENT_FIELDS } from "@/constants/content-i18n";
import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";
import type { AppLocale } from "@/constants/locales";
import { categoryForAudience } from "@/constants/person";
import {
  copiesByLocale,
  emptyTranslationsForm,
  translationsPayload,
} from "@/lib/content-i18n/pick";
import type { MailingListFormValues } from "@/types/forms";

export interface MailingList {
  id: string;
  name: string;
  description?: string | null;
  audienceKind: "trophy_camper" | "trophy_participant" | "chaperone";
  translations?: Partial<
    Record<AppLocale, Partial<{ name: string; description: string }>>
  >;
  members?: Array<{
    id: string;
    personId: string;
    person?: {
      id: string;
      fullName: string;
      email: string;
      phone?: string | null;
    };
  }>;
}

export const emptyMailingListForm: MailingListFormValues = {
  translations: emptyTranslationsForm({ name: "", description: "" }),
  audienceKind: MAILING_LIST_AUDIENCE_KINDS.TROPHY_CAMPER,
  personIds: [],
};

export function mailingListToFormValues(
  record?: MailingList | null
): MailingListFormValues {
  return {
    translations: copiesByLocale(
      record?.translations,
      CONTENT_FIELDS.mailing_list,
      {
        name: record?.name,
        description: record?.description,
      }
    ),
    audienceKind:
      categoryForAudience(record?.audienceKind) ??
      MAILING_LIST_AUDIENCE_KINDS.TROPHY_CAMPER,
    personIds: record?.members?.map((member) => member.personId) ?? [],
  };
}

export function mailingListFormToPayload(values: MailingListFormValues) {
  return {
    audienceKind: values.audienceKind,
    personIds: values.personIds,
    translations: translationsPayload(values.translations),
  };
}
