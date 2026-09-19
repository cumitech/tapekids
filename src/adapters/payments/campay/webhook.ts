import { createHmac, timingSafeEqual } from "node:crypto";

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
      key,
      nested == null ? "" : String(nested),
    ])
  );
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(
    base64 + "=".repeat((4 - (base64.length % 4)) % 4),
    "base64"
  ).toString("utf8");
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function verifyCampayJwt(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [header, payload, signature] = parts;
  try {
    const headerJson = JSON.parse(base64UrlDecode(header)) as { alg?: string };
    if (headerJson.alg !== "HS256") {
      return false;
    }
  } catch {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest();
  const given = Buffer.from(base64UrlEncode(expected));
  const wanted = Buffer.from(signature);
  if (given.length !== wanted.length) {
    return false;
  }
  if (!timingSafeEqual(given, wanted)) {
    return false;
  }
  return !isJwtExpired(decodeCampayJwtPayload(token));
}

function isJwtExpired(claims: Record<string, string>): boolean {
  const exp = Number(claims.exp);
  if (!Number.isFinite(exp)) {
    return false;
  }
  const expMs = exp > 1e12 ? exp : exp * 1000;
  return expMs < Date.now();
}

export function decodeCampayJwtPayload(token: string): Record<string, string> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {};
  }
  try {
    return asRecord(JSON.parse(base64UrlDecode(parts[1])));
  } catch {
    return {};
  }
}

function signatureFromRequest(request: Request, payload: Record<string, string>) {
  const header =
    request.headers.get("x-campay-signature") ||
    request.headers.get("authorization") ||
    "";
  const bearer = header.replace(/^(Token|Bearer)\s+/i, "").trim();
  return (payload.signature || payload.sign || bearer).trim();
}

export async function parseCampayWebhook(
  request: Request
): Promise<Record<string, string>> {
  let payload: Record<string, string> = {};

  if (request.method === "GET") {
    payload = Object.fromEntries(new URL(request.url).searchParams.entries());
  } else {
    try {
      payload = asRecord(await request.json());
    } catch {
      payload = {};
    }
  }

  const signature = signatureFromRequest(request, payload);
  if (signature) {
    payload.signature = signature;
  }

  return payload;
}

export function verifiedCampayWebhookPayload(
  payload: Record<string, string>,
  secret: string
): Record<string, string> | null {
  const signature = (payload.signature || "").trim();
  if (!signature || !verifyCampayJwt(signature, secret)) {
    return null;
  }
  return {
    ...payload,
    ...decodeCampayJwtPayload(signature),
    signature,
  };
}
