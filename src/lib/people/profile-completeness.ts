export function filledText(value?: string | Date | null) {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  return Boolean(value && String(value).trim());
}

export function isPersonProfileComplete(person?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  address?: string | null;
  churchName?: string | null;
  churchPastorName?: string | null;
  churchAddress?: string | null;
  town?: string | null;
  region?: string | null;
  division?: string | null;
  subDivision?: string | null;
  parentGuardianName?: string | null;
  parentGuardianPhone?: string | null;
  emergencyContacts?: Array<{ name?: string | null; phone?: string | null }>;
} | null) {
  if (!person) {
    return false;
  }

  const hasGuardian = Boolean(
    (person.emergencyContacts ?? []).some(
      (contact) => filledText(contact.name) && filledText(contact.phone)
    ) ||
      (filledText(person.parentGuardianName) &&
        filledText(person.parentGuardianPhone))
  );

  return (
    filledText(person.firstName) &&
    filledText(person.lastName) &&
    filledText(person.email) &&
    filledText(person.phone) &&
    filledText(person.dateOfBirth) &&
    filledText(person.address) &&
    filledText(person.churchName) &&
    filledText(person.churchPastorName) &&
    filledText(person.churchAddress) &&
    filledText(person.town) &&
    filledText(person.region) &&
    filledText(person.division) &&
    filledText(person.subDivision) &&
    hasGuardian
  );
}
