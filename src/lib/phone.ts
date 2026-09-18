import {
  DEFAULT_PHONE_COUNTRY_ISO,
  PHONE_COUNTRIES,
  PHONE_COUNTRY_BY_ISO,
  type PhoneCountry,
} from "@/constants/phone";

export type ParsedPhone = {
  iso: string;
  dial: string;
  local: string;
};

const SORTED_PHONE_COUNTRIES = [...PHONE_COUNTRIES].sort(
  (left, right) => right.dial.length - left.dial.length
);

function defaultCountry(): PhoneCountry {
  return PHONE_COUNTRY_BY_ISO[DEFAULT_PHONE_COUNTRY_ISO];
}

export function digitsOnly(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function parsePhone(value: string | null | undefined): ParsedPhone {
  const fallback = defaultCountry();
  const digits = digitsOnly(value);

  if (!digits) {
    return { iso: fallback.iso, dial: fallback.dial, local: "" };
  }

  if (digits.length === 9 && digits.startsWith("6")) {
    return { iso: fallback.iso, dial: fallback.dial, local: digits };
  }

  const match = SORTED_PHONE_COUNTRIES.find(
    (country) =>
      digits.startsWith(country.dial) && digits.length > country.dial.length
  );

  if (match) {
    return {
      iso: match.iso,
      dial: match.dial,
      local: digits.slice(match.dial.length),
    };
  }

  return { iso: fallback.iso, dial: fallback.dial, local: digits };
}

export function composePhone(iso: string, local: string) {
  const country = PHONE_COUNTRY_BY_ISO[iso] ?? defaultCountry();
  let localDigits = digitsOnly(local);

  if (localDigits.startsWith(country.dial)) {
    localDigits = localDigits.slice(country.dial.length);
  }

  if (!localDigits) {
    return "";
  }

  return `+${country.dial}${localDigits}`;
}

export function formatPhoneDisplay(value: string | null | undefined) {
  const parsed = parsePhone(value);
  if (!parsed.local) {
    return "";
  }
  return `+${parsed.dial} ${parsed.local}`;
}

export function normalizeStoredPhone(value: string | null | undefined) {
  const parsed = parsePhone(value);
  return composePhone(parsed.iso, parsed.local) || null;
}

export function toCameroonMsisdn(
  phone: string,
  options: { required?: boolean } = {}
): string | undefined {
  const required = options.required ?? true;
  const digits = digitsOnly(phone);

  if (!digits) {
    if (required) {
      throw new Error("Phone number is required.");
    }
    return undefined;
  }

  let normalized = digits;
  if (normalized.length === 9 && normalized.startsWith("6")) {
    normalized = `237${normalized}`;
  }

  if (normalized.length !== 12 || !normalized.startsWith("237")) {
    throw new Error("Phone must be 237 followed by 9 digits.");
  }

  return normalized;
}
