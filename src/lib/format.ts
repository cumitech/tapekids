function pad(value: number) {
  return String(value).padStart(2, "0");
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function calendarDate(value: string | Date) {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function instant(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | Date | null | undefined,
  _locale?: string
) {
  if (!value) {
    return "";
  }
  const date = calendarDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return String(value);
  }
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale?: string
) {
  if (!value) {
    return "";
  }
  const date = instant(value);
  if (!date) {
    return String(value);
  }
  return `${formatDate(date, locale)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatPresentedValue(value: unknown, locale?: string): unknown {
  if (typeof value === "string" && DATE_TIME.test(value)) {
    return formatDateTime(value, locale);
  }
  if (typeof value === "string" && DATE_ONLY.test(value)) {
    return formatDate(value, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatPresentedValue(item, locale));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        formatPresentedValue(nested, locale),
      ])
    );
  }
  return value;
}

export function formatMoney(
  amount: string | number | null | undefined,
  currency = "XAF"
) {
  const parsed = Number(amount);
  const safe = Number.isFinite(parsed) ? parsed : 0;
  return `${safe.toLocaleString("fr-FR")} ${currency}`;
}
