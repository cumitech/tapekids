import { DEFAULT_LOCALE, type AppLocale } from "@/constants/locales";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { isAppLocale } from "@/lib/locale";
import type { ThemeMode, UiPreferencesState } from "@/types/ui-preferences";
import { setLocaleCookie } from "@/utils/locale-cookie";

export const defaultUiPreferences: UiPreferencesState = {
  sidebarOpen: true,
  theme: "light",
  locale: DEFAULT_LOCALE,
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function parseTheme(value: unknown): ThemeMode | null {
  return value === "dark" || value === "light" ? value : null;
}

function parseLocale(value: unknown): AppLocale | null {
  return typeof value === "string" && isAppLocale(value) ? value : null;
}

function parseSidebarOpen(value: unknown): boolean | null {
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return match ? match.slice(name.length + 1) : null;
}

export function loadUiPreferences(): UiPreferencesState {
  if (!canUseStorage()) {
    return defaultUiPreferences;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.UI_PREFERENCES);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UiPreferencesState>;
      return {
        sidebarOpen: parseSidebarOpen(parsed.sidebarOpen) ?? defaultUiPreferences.sidebarOpen,
        theme: parseTheme(parsed.theme) ?? defaultUiPreferences.theme,
        locale: parseLocale(parsed.locale) ?? defaultUiPreferences.locale,
      };
    }
  } catch {
    // Fall through to legacy keys.
  }

  return {
    sidebarOpen:
      parseSidebarOpen(readCookie(STORAGE_KEYS.SIDEBAR)) ??
      defaultUiPreferences.sidebarOpen,
    theme:
      parseTheme(window.localStorage.getItem(STORAGE_KEYS.THEME)) ??
      defaultUiPreferences.theme,
    locale: parseLocale(readCookie(STORAGE_KEYS.LOCALE)) ?? defaultUiPreferences.locale,
  };
}

export function saveUiPreferences(state: UiPreferencesState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEYS.UI_PREFERENCES, JSON.stringify(state));
  window.localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
  setLocaleCookie(state.locale);
  document.cookie = `${STORAGE_KEYS.SIDEBAR}=${state.sidebarOpen}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; samesite=lax`;
}
