export function formatDate(
  value: string | Date | null | undefined,
  locale: string
) {
  if (!value) {
    return "";
  }
  const iso =
    typeof value === "string"
      ? value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
      : null;
  const date = iso
    ? new Date(`${iso}T00:00:00`)
    : value instanceof Date
      ? value
      : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CM" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale: string
) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CM" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatMoney(
  amount: string | number | null | undefined,
  currency = "XAF"
) {
  const parsed = Number(amount);
  const safe = Number.isFinite(parsed) ? parsed : 0;
  return `${safe.toLocaleString("fr-FR")} ${currency}`;
}
