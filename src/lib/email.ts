/**
 * Practical email check: HTML-style structure, plus Unicode letters in the
 * name and domain (internationalized email). A domain ending such as .com
 * is still required.
 */
const EMAIL_PATTERN =
  /^(?:[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+(?:\.[\p{L}\p{N}!#$%&'*+/=?^_`{|}~-]+)*)@(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,}$/u;

const INVISIBLE = /[\u200B-\u200D\uFEFF\u00AD\u00A0]/g;

export function normalizeEmail(value: unknown): string {
  let text = String(value ?? "")
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .trim();

  text = text.replace(/^mailto:/i, "").trim();
  if (
    (text.startsWith("<") && text.endsWith(">")) ||
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }

  return text.toLowerCase();
}

export function isStandardEmail(value: string, maxLength = 254): boolean {
  if (!value || value.length > maxLength) {
    return false;
  }
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) {
    return false;
  }
  if (value.slice(0, at).length > 64) {
    return false;
  }
  return EMAIL_PATTERN.test(value);
}

/** Hosts often typed without .com on Young Foundations exports. */
const BARE_MAIL_HOSTS: Record<string, string> = {
  gmail: "gmail.com",
  googlemail: "googlemail.com",
  yahoo: "yahoo.com",
  ymail: "ymail.com",
  rocketmail: "rocketmail.com",
  hotmail: "hotmail.com",
  outlook: "outlook.com",
  live: "live.com",
  msn: "msn.com",
  icloud: "icloud.com",
  aol: "aol.com",
  protonmail: "protonmail.com",
  gmx: "gmx.com",
};

/**
 * Keep a usable address from an official export. Completes a bare host such
 * as gmail, and returns null when the cell cannot be sent to, so the person
 * can still be imported.
 */
export function repairImportedEmail(value: unknown): string | null {
  const text = normalizeEmail(value).replace(/\s+/g, "");
  if (!text) {
    return null;
  }
  const at = text.lastIndexOf("@");
  if (at <= 0) {
    return null;
  }
  const local = text.slice(0, at).replace(/\.+$/, "");
  let domain = text.slice(at + 1).replace(/^\.+|\.+$/g, "");
  if (!domain.includes(".")) {
    domain = BARE_MAIL_HOSTS[domain] ?? domain;
  }
  const email = `${local}@${domain}`;
  return isStandardEmail(email, 128) ? email : null;
}
