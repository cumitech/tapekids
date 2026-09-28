export const APP_SETTING_KEYS = {
  INVITATION_LINKS_OPEN: "invitation_links_open",
} as const;

export type AppSettingKey =
  (typeof APP_SETTING_KEYS)[keyof typeof APP_SETTING_KEYS];

export const APP_SETTING_CATALOG = [
  {
    key: APP_SETTING_KEYS.INVITATION_LINKS_OPEN,
    type: "boolean" as const,
    defaultValue: "true",
  },
] as const;

export type AppSettingCatalogItem = (typeof APP_SETTING_CATALOG)[number];

export function appSettingCatalogItem(key: string) {
  return APP_SETTING_CATALOG.find((item) => item.key === key) ?? null;
}
