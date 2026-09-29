export const PERSON_GENDERS = ["female", "male"] as const;

export type PersonGender = (typeof PERSON_GENDERS)[number];

/** Adult shirt sizes, stored as letter codes with no measurements. */
export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

/** Older rows used SM/MD/LG and XXL/XXXL. "X" is accepted as extra-small. */
const SHIRT_SIZE_ALIASES: Record<string, (typeof SHIRT_SIZES)[number]> = {
  X: "XS",
  XS: "XS",
  S: "S",
  SM: "S",
  M: "M",
  MD: "M",
  L: "L",
  LG: "L",
  XL: "XL",
  XXL: "2XL",
  "2XL": "2XL",
  XXXL: "3XL",
  "3XL": "3XL",
};

export function canonicalShirtSize<T>(value: T): (typeof SHIRT_SIZES)[number] | T {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return SHIRT_SIZE_ALIASES[trimmed.toUpperCase()] ?? value;
}

export const MIN_GUARDIANS = 1;
export const MAX_GUARDIANS = 3;

/** Top-level person groups used in directory and Excel import. */
export const PERSON_CATEGORY_GROUPS = {
  CAMPER: "camper",
  CHAPERONE: "chaperone",
} as const;

export type PersonCategoryGroup =
  (typeof PERSON_CATEGORY_GROUPS)[keyof typeof PERSON_CATEGORY_GROUPS];

/**
 * Leaf categories stored on `people.category`.
 * Trophy campers attend multi-day camps; trophy participants attend day events.
 */
export const PERSON_CATEGORIES = {
  TROPHY_CAMPER: "trophy_camper",
  TROPHY_PARTICIPANT: "trophy_participant",
  CHAPERONE: "chaperone",
} as const;

export type PersonCategory =
  (typeof PERSON_CATEGORIES)[keyof typeof PERSON_CATEGORIES];

export const PERSON_CATEGORY_VALUES = Object.values(PERSON_CATEGORIES);

export const PERSON_CATEGORIES_FOR_CAMPS: PersonCategory[] = [
  PERSON_CATEGORIES.TROPHY_CAMPER,
  PERSON_CATEGORIES.CHAPERONE,
];

export const PERSON_CATEGORIES_FOR_DAY_EVENTS: PersonCategory[] = [
  PERSON_CATEGORIES.TROPHY_PARTICIPANT,
  PERSON_CATEGORIES.CHAPERONE,
];

export function isPersonGender(value: unknown): value is PersonGender {
  return PERSON_GENDERS.includes(value as PersonGender);
}

export function isPersonCategory(value: unknown): value is PersonCategory {
  return PERSON_CATEGORY_VALUES.includes(value as PersonCategory);
}

/** Older mailing lists stored camper/coordinator. Both map onto a person category. */
const AUDIENCE_CATEGORY_ALIASES: Record<string, PersonCategory> = {
  trophy_camper: PERSON_CATEGORIES.TROPHY_CAMPER,
  camper: PERSON_CATEGORIES.TROPHY_CAMPER,
  trophy_participant: PERSON_CATEGORIES.TROPHY_PARTICIPANT,
  chaperone: PERSON_CATEGORIES.CHAPERONE,
  coordinator: PERSON_CATEGORIES.CHAPERONE,
};

export function categoryForAudience(value: unknown): PersonCategory | null {
  const key = String(value ?? "").trim();
  return AUDIENCE_CATEGORY_ALIASES[key] ?? null;
}

export function parsePersonGender(raw: unknown): PersonGender | null {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!value) {
    return null;
  }
  if (value === "m" || value === "male" || value === "homme" || value === "h") {
    return "male";
  }
  if (
    value === "f" ||
    value === "female" ||
    value === "femme" ||
    value === "w"
  ) {
    return "female";
  }
  return null;
}
