const AGE_BOUND_MESSAGE = "Age must be a whole number from 0 to 120.";

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function calendarDate(value: unknown): CalendarDate | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return validDate(Number(match[1]), Number(match[2]), Number(match[3]));
    }
  }

  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return validDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

function validDate(year: number, month: number, day: number): CalendarDate | null {
  if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const check = new Date(year, month - 1, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month - 1 ||
    check.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Completed years on `on`. The same dates always return the same age. */
export function ageInYears(dateOfBirth: unknown, on: unknown = new Date()): number | null {
  const born = calendarDate(dateOfBirth);
  const when = calendarDate(on);
  if (!born || !when) {
    return null;
  }

  let age = when.year - born.year;
  if (when.month < born.month || (when.month === born.month && when.day < born.day)) {
    age -= 1;
  }
  return age < 0 ? null : age;
}

export function parseAgeBound(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  const age = Number(text);
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return null;
  }
  return age;
}

export function ageBoundError(value: unknown): string | null {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return null;
  }
  return parseAgeBound(value) == null ? AGE_BOUND_MESSAGE : null;
}

export function ageRangeError(
  minAge: number | null | undefined,
  maxAge: number | null | undefined
): string | null {
  if (minAge != null && maxAge != null && minAge > maxAge) {
    return "Minimum age cannot be greater than maximum age.";
  }
  return null;
}

export function formatAgeRange(
  minAge: number | null | undefined,
  maxAge: number | null | undefined
): string | null {
  if (minAge != null && maxAge != null) {
    return `${minAge}–${maxAge}`;
  }
  if (minAge != null) {
    return `${minAge}+`;
  }
  if (maxAge != null) {
    return `0–${maxAge}`;
  }
  return null;
}

function camperAgeBlock(input: {
  dateOfBirth: unknown;
  minAge?: number | null;
  maxAge?: number | null;
  on: unknown;
}): "missing-birth-date" | "outside-range" | null {
  const minAge = input.minAge ?? null;
  const maxAge = input.maxAge ?? null;
  if (minAge == null && maxAge == null) {
    return null;
  }

  const age = ageInYears(input.dateOfBirth, input.on);
  if (age == null) {
    return "missing-birth-date";
  }
  if ((minAge != null && age < minAge) || (maxAge != null && age > maxAge)) {
    return "outside-range";
  }
  return null;
}

export function camperAgeBlockMessage(input: {
  dateOfBirth: unknown;
  minAge?: number | null;
  maxAge?: number | null;
  on: unknown;
}): string | null {
  const reason = camperAgeBlock(input);
  if (!reason) {
    return null;
  }
  const range = formatAgeRange(input.minAge, input.maxAge) ?? "";
  if (reason === "missing-birth-date") {
    return `This event is for ages ${range}. Add a date of birth before accepting.`;
  }
  return `This event is for ages ${range}. This camper does not qualify.`;
}
