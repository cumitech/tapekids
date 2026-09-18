import type { AppLocale } from "@/constants/locales";

export type ThemeMode = "dark" | "light";

export type UiPreferencesState = {
  sidebarOpen: boolean;
  theme: ThemeMode;
  locale: AppLocale;
};
