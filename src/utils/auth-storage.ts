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

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getRememberMe(): boolean {
  if (!canUseStorage()) {
    return true;
  }
  return window.localStorage.getItem(STORAGE_KEYS.AUTH_REMEMBER) !== "0";
}

export function setRememberMe(remember: boolean): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.AUTH_REMEMBER, remember ? "1" : "0");
}

export function getSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  return (
    parseSession(window.localStorage.getItem(STORAGE_KEYS.AUTH_SESSION)) ??
    parseSession(window.sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION))
  );
}

export function setSession(
  session: AuthSession,
  options?: { remember?: boolean }
): void {
  if (!canUseStorage()) {
    return;
  }

  const remember = options?.remember ?? getRememberMe();
  setRememberMe(remember);
  const payload = JSON.stringify(session);

  if (remember) {
    window.sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    window.localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, payload);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    window.sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, payload);
  }
  forgetAuthQueries();
}

export function enterSession(session: AuthSession, href: string): void {
  setSession(session, { remember: true });
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
  window.sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  forgetAuthQueries();
}

export function getAccessToken(): string | null {
  return getSession()?.token ?? null;
}
