export function readEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim().replace(/^['"]|['"]$/g, "");
}

export function envFlag(name: string, fallback = false): boolean {
  const value = readEnv(name).toLowerCase();
  if (!value) {
    return fallback;
  }
  return value === "true" || value === "1" || value === "yes";
}

export function appBaseUrl(): string {
  return (
    readEnv("NEXT_PUBLIC_APP_URL") ||
    readEnv("APP_URL") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

const MAILGUN_US = "https://api.mailgun.net";
const MAILGUN_EU = "https://api.eu.mailgun.net";

function uniqueNonEmpty(values: string[]) {
  return values.filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index
  );
}

export function mailgunApiOrigin(raw: string) {
  const trimmed = raw.replace(/\/$/, "");
  if (!trimmed) {
    return MAILGUN_EU;
  }
  try {
    const url = new URL(trimmed);
    if (url.hostname === "api.mailgun.net") {
      return MAILGUN_US;
    }
    if (url.hostname === "api.eu.mailgun.net") {
      return MAILGUN_EU;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return trimmed.replace(/\/v3$/i, "");
  }
}

export function mailgunConfig() {
  const preferredOrigin = mailgunApiOrigin(
    readEnv("MAILGUN_BASE_URL", MAILGUN_EU)
  );
  const otherOrigin = preferredOrigin === MAILGUN_EU ? MAILGUN_US : MAILGUN_EU;

  return {
    domain: readEnv("MAILGUN_DOMAIN"),
    from: readEnv("MAILGUN_FROM"),
    fromName: readEnv("MAILGUN_FROM_NAME", "Kids Events Cameroon"),
    preferredOrigin,
    origins: uniqueNonEmpty([preferredOrigin, otherOrigin]),
    apiKeys: uniqueNonEmpty([
      readEnv("MAILGUN_API_KEY"),
      readEnv("MAILGUN_SENDING_KEY"),
    ]),
  };
}

export function isMailConfigured(): boolean {
  const config = mailgunConfig();
  return Boolean(config.apiKeys[0] && config.domain);
}
