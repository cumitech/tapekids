export const RESOURCE_I18N_KEYS = {
  dashboard: "dashboard",
  people: "people",
  "mailing-lists": "mailingLists",
  events: "events",
  "audit-logs": "auditLogs",
  camp: "camp",
  sponsorships: "sponsorships",
  profile: "profile",
} as const;

export type AppResourceName = keyof typeof RESOURCE_I18N_KEYS;

export function resourceI18nKey(resource: string) {
  return RESOURCE_I18N_KEYS[resource as AppResourceName] ?? resource;
}
