import { STORAGE_KEYS } from "@/constants/storage-keys";
import { forgetAuthQueries } from "@/lib/client/query-client";
import type { UserRole } from "@/constants/user-roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  personId?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.AUTH_SESSION,
    JSON.stringify(session)
  );
  forgetAuthQueries();
}

export function enterSession(session: AuthSession, href: string): void {
  setSession(session);
  if (canUseStorage()) {
    window.location.replace(href);
  }
}

export function leaveSession(href: string): void {
  clearSession();
  if (canUseStorage()) {
    window.location.replace(href);
  }
}

export function clearSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  forgetAuthQueries();
}

export function getAccessToken(): string | null {
  return getSession()?.token ?? null;
}
