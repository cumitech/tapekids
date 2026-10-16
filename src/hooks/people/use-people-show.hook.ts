"use client";

import { useShow, useTranslate } from "@refinedev/core";

import { useDashboardFormModal } from "@/hooks/core/use-dashboard-form-modal.hook";
import { useResourceLabels } from "@/hooks/core/use-resource-labels.hook";
import { formatPhoneDisplay } from "@/lib/phone";
import {
  guardiansFromRecord,
  type Person,
} from "@/models/people/person.model";

export const PERSON_SHOW_FIELDS = [
  "fullName",
  "isTrophy",
  "category",
  "email",
  "phone",
  "yfId",
  "points",
  "ageYears",
  "dateOfBirth",
  "gender",
  "shirtSize",
  "address",
  "churchName",
  "churchPastorName",
  "churchAddress",
  "town",
  "region",
  "division",
  "subDivision",
  "medicalNotes",
] as const;

export function usePeopleShowPage() {
  const translate = useTranslate();
  const { openEdit } = useDashboardFormModal();
  const labels = useResourceLabels("people", PERSON_SHOW_FIELDS);
  const { query } = useShow<Person>({ resource: "people" });
  const record = query.data?.data;
  const guardians = guardiansFromRecord(record).filter(
    (guardian) => guardian.name || guardian.phone
  );

  const detailFields = record
    ? Object.fromEntries(
        PERSON_SHOW_FIELDS.map((key) => [
          key,
          key === "gender" && record.gender
            ? translate(`people.genders.${record.gender}`)
            : key === "shirtSize" && record.shirtSize
              ? translate(`people.shirtSizes.${record.shirtSize}`)
              : key === "category" && record.category
                ? translate(`people.categories.${record.category}`)
                : record[key as keyof Person],
        ])
      )
    : {};

  return {
    translate,
    labels,
    record,
    guardians,
    detailFields,
    openEdit,
    refetch: () => void query.refetch(),
    formatGuardianPhone: (phone?: string | null) =>
      formatPhoneDisplay(phone) || phone || "-",
  };
}
