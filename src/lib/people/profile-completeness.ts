import { GUEST_PROFILE_PATH } from "@/constants/guest-portal";

export function filledText(value?: string | Date | null) {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  return Boolean(value && String(value).trim());
}

export const PROFILE_REQUIRED_TEXT_FIELDS = [
  "fullName",
  "email",
  "phone",
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
] as const;

export type ProfileRequiredTextField =
  (typeof PROFILE_REQUIRED_TEXT_FIELDS)[number];

export const PROFILE_GEO_FIELDS = [
  "region",
  "division",
  "subDivision",
  "town",
] as const;

export type PersonProfileFields = Partial<
  Record<ProfileRequiredTextField, string | Date | null>
> & {
  parentGuardianName?: string | null;
  parentGuardianPhone?: string | null;
  emergencyContacts?: Array<{ name?: string | null; phone?: string | null }>;
};

export function hasGuardianDetails(person?: PersonProfileFields | null) {
  if (!person) {
    return false;
  }
  return Boolean(
    (person.emergencyContacts ?? []).some(
      (contact) => filledText(contact.name) && filledText(contact.phone)
    ) ||
      (filledText(person.parentGuardianName) &&
        filledText(person.parentGuardianPhone))
  );
}

export function isPersonProfileComplete(
  person?: PersonProfileFields | null
): boolean {
  if (!person) {
    return false;
  }
  return (
    PROFILE_REQUIRED_TEXT_FIELDS.every((field) =>
      filledText(person[field])
    ) && hasGuardianDetails(person)
  );
}

export function requiredIfComplete(requireComplete: boolean) {
  return requireComplete ? ({ required: true } as const) : {};
}

export function isGuestProfilePath(pathname?: string | null) {
  return Boolean(pathname?.includes(GUEST_PROFILE_PATH));
}
