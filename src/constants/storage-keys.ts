export const STORAGE_KEYS = {
  AUTH_SESSION: "kec.auth.session",
  AUTH_REMEMBER: "kec.auth.remember",
  LOCALE: "kec.locale",
  THEME: "kec.theme",
  UI_PREFERENCES: "kec.ui.preferences",
  SIDEBAR: "kec.sidebar",
  QUERY_CACHE: "kec.query.cache",
} as const;

export const UI_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
