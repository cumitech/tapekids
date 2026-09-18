const REDACT = new Set([
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "CAMPAY_PASSWORD",
  "CAMPAY_WEBHOOK_SECRET",
  "CAMPAY_ACCESS_TOKEN",
  "CAMPAY_APPID",
  "CAMPAY_USERNAME",
  "MAILGUN_API_KEY",
  "MAILGUN_PASSWORD",
  "MAILGUN_SENDING_KEY",
]);

export function snapshot(value: unknown): unknown {
  if (value == null) {
    return value;
  }
  if (typeof value === "object" && value !== null && "toJSON" in value) {
    return redact((value as { toJSON: () => unknown }).toJSON());
  }
  return redact(value);
}

function redact(value: unknown, seen = new WeakSet<object>()): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  if (seen.has(value)) {
    return undefined;
  }
  seen.add(value);
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    output[key] = REDACT.has(key) ? "[redacted]" : redact(nested, seen);
  }
  return output;
}

export function diffChanges(before: unknown, after: unknown) {
  const previous = (before ?? {}) as Record<string, unknown>;
  const next = (after ?? {}) as Record<string, unknown>;
  const keys = Array.from(
    new Set([...Object.keys(previous), ...Object.keys(next)])
  );
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  for (const key of keys) {
    if (key === "updatedAt" || key === "createdAt") {
      continue;
    }
    const from = previous[key];
    const to = next[key];
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[key] = { from, to };
    }
  }

  return changes;
}
