export function personDisplayName(person?: {
  fullName?: string | null;
} | null) {
  return person?.fullName?.trim() || "";
}

export function personGreetingName(person?: {
  fullName?: string | null;
} | null) {
  const full = personDisplayName(person);
  if (!full) {
    return "";
  }
  return full.split(/\s+/)[0] ?? full;
}

export function personNameParts(fullName?: string | null) {
  const trimmed = fullName?.trim() || "";
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}
