import type { Path } from "react-hook-form";

import type { PersonFormValues } from "@/types/forms";

export const PERSON_FORM_STEPS = [
  "identity",
  "location",
  "guardians",
  "church",
  "notes",
] as const;

export type PersonFormStep = (typeof PERSON_FORM_STEPS)[number];

export const PERSON_STEP_FIELD_PATHS: Record<
  PersonFormStep,
  Path<PersonFormValues>[]
> = {
  identity: ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender"],
  location: ["country", "region", "division", "subDivision", "town", "address"],
  guardians: ["guardians"],
  church: ["churchName", "churchPastorName", "churchAddress"],
  notes: ["medicalNotes"],
};
