import { createHmac, timingSafeEqual } from "node:crypto";

import {
  isAdminRole,
  isStaffDashboardRole,
  type UserRole,
} from "@/constants/user-roles";
import type { User } from "@/data/entities/user";
import { ForbiddenException } from "@/exceptions/forbidden.exception";
import { UnauthorizedException } from "@/exceptions/unauthorized.exception";
import { UserRepository } from "@/data/repositories/user.repository";

type SessionPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
  sv: number;
  exp: number;
};

const userRepository = new UserRepository();

function secret(): string {
  const value = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error("Missing SESSION_SECRET");
  }
  return value;
}

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  personId?: string | null;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.username,
    roles: [user.role],
    personId: user.personId ?? null,
  };
}

export function signSession(user: User): string {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    roles: [user.role],
    sv: user.sessionVersion ?? 0,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySession(token: string): SessionPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    throw new UnauthorizedException();
  }

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    throw new UnauthorizedException();
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  if (!payload.sub || payload.exp < Date.now()) {
    throw new UnauthorizedException();
  }

  return payload;
}

function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new UnauthorizedException();
  }
  return token;
}

export async function requireUser(request: Request): Promise<User> {
  const token = bearerToken(request);
  const payload = verifySession(token);
  const user = await userRepository.findById(payload.sub);
  if ((payload.sv ?? 0) !== (user.sessionVersion ?? 0)) {
    throw new UnauthorizedException();
  }
  if (!user.verified) {
    throw new UnauthorizedException("Verify your email before continuing.");
  }
  return user;
}

export async function optionalUser(request: Request): Promise<User | null> {
  try {
    return await requireUser(request);
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireUser(request);
  if (!isAdminRole(user.role)) {
    throw new ForbiddenException("Admin role is required.");
  }
  return user;
}

export async function requireStaffOrAdmin(request: Request): Promise<User> {
  const user = await requireUser(request);
  if (!isStaffDashboardRole(user.role)) {
    throw new ForbiddenException();
  }
  return user;
}
