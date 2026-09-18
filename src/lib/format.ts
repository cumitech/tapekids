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
