export const PERSON_GENDERS = ["female", "male"] as const;

export type PersonGender = (typeof PERSON_GENDERS)[number];

export const MIN_GUARDIANS = 1;
export const MAX_GUARDIANS = 3;

export function isPersonGender(value: unknown): value is PersonGender {
  return PERSON_GENDERS.includes(value as PersonGender);
}
