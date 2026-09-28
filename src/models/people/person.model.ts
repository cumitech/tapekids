import { DEFAULT_COUNTRY } from "@/constants/geo";
import { MAX_GUARDIANS, canonicalShirtSize, type PersonCategory } from "@/constants/person";
import { normalizeStoredPhone } from "@/lib/phone";
import type { GuardianFormValue, PersonFormValues } from "@/types/forms";

export function dateOnlyInput(value?: string | Date | null): string {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match?.[1] ?? "";
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

export { MIN_GUARDIANS, MAX_GUARDIANS } from "@/constants/person";
export const GUARDIAN_RELATION = "guardian";

export interface Person {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  shirtSize?: string | null;
  address?: string | null;
  churchName?: string | null;
  churchPastorName?: string | null;
  churchAddress?: string | null;
  country?: string | null;
  town?: string | null;
  region?: string | null;
  division?: string | null;
  subDivision?: string | null;
  parentGuardianName?: string | null;
  parentGuardianPhone?: string | null;
  medicalNotes?: string | null;
  yfId?: string | null;
  points?: number | null;
  ageYears?: number | null;
  isTrophy?: boolean;
  category?: PersonCategory | null;
  emergencyContacts?: Array<{
    id?: string;
    name: string;
    phone: string;
    relation: string;
  }>;
}

export function emptyGuardian(): GuardianFormValue {
  return { name: "", phone: "" };
}

export const emptyPersonForm: PersonFormValues = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  shirtSize: "",
  address: "",
  churchName: "",
  churchPastorName: "",
  churchAddress: "",
  country: DEFAULT_COUNTRY,
  town: "",
  region: "",
  division: "",
  subDivision: "",
  guardians: [emptyGuardian()],
  medicalNotes: "",
  yfId: "",
  points: "",
  ageYears: "",
  isTrophy: false,
  category: "",
};

export function guardiansFromRecord(record?: Person | null): GuardianFormValue[] {
  const fromContacts = (record?.emergencyContacts ?? [])
    .map((contact) => ({
      name: contact.name ?? "",
      phone: normalizeStoredPhone(contact.phone) ?? "",
    }))
    .filter((guardian) => guardian.name || guardian.phone)
    .slice(0, MAX_GUARDIANS);

  if (fromContacts.length > 0) {
    return fromContacts;
  }

  const fallback = {
    name: record?.parentGuardianName ?? "",
    phone: normalizeStoredPhone(record?.parentGuardianPhone) ?? "",
  };
  if (fallback.name || fallback.phone) {
    return [fallback];
  }

  return [emptyGuardian()];
}

export function filledGuardians(values: GuardianFormValue[]) {
  return values
    .map((guardian) => ({
      name: guardian.name.trim(),
      phone: normalizeStoredPhone(guardian.phone) ?? "",
    }))
    .filter((guardian) => guardian.name && guardian.phone)
    .slice(0, MAX_GUARDIANS);
}

export function personToFormValues(record?: Person | null): PersonFormValues {
  return {
    fullName: record?.fullName ?? "",
    email: record?.email ?? "",
    phone: normalizeStoredPhone(record?.phone) ?? "",
    dateOfBirth: dateOnlyInput(record?.dateOfBirth),
    gender: record?.gender ?? "",
    shirtSize: canonicalShirtSize(record?.shirtSize ?? ""),
    address: record?.address ?? "",
    churchName: record?.churchName ?? "",
    churchPastorName: record?.churchPastorName ?? "",
    churchAddress: record?.churchAddress ?? "",
    country: record?.country || DEFAULT_COUNTRY,
    town: record?.town ?? "",
    region: record?.region ?? "",
    division: record?.division ?? "",
    subDivision: record?.subDivision ?? "",
    guardians: guardiansFromRecord(record),
    medicalNotes: record?.medicalNotes ?? "",
    yfId: record?.yfId ?? "",
    points: record?.points != null ? String(record.points) : "",
    ageYears: record?.ageYears != null ? String(record.ageYears) : "",
    isTrophy: Boolean(record?.isTrophy),
    category: record?.category ?? "",
  };
}

export function personFormToPayload(values: PersonFormValues) {
  const guardians = filledGuardians(values.guardians);
  const first = guardians[0];

  return {
    fullName: values.fullName,
    email: values.email || null,
    phone: normalizeStoredPhone(values.phone),
    dateOfBirth: values.dateOfBirth || null,
    gender: values.gender || null,
    shirtSize: values.shirtSize || null,
    address: values.address || null,
    churchName: values.churchName || null,
    churchPastorName: values.churchPastorName || null,
    churchAddress: values.churchAddress || null,
    country: DEFAULT_COUNTRY,
    town: values.town || null,
    region: values.region || null,
    division: values.division || null,
    subDivision: values.subDivision || null,
    parentGuardianName: first?.name ?? null,
    parentGuardianPhone: first?.phone ?? null,
    medicalNotes: values.medicalNotes || null,
    yfId: values.yfId || null,
    points: values.points ? Number(values.points) : null,
    ageYears: values.ageYears ? Number(values.ageYears) : null,
    isTrophy: Boolean(values.isTrophy),
    category: values.category || null,
    emergencyContacts: guardians.map((guardian) => ({
      name: guardian.name,
      phone: guardian.phone,
      relation: GUARDIAN_RELATION,
    })),
  };
}
