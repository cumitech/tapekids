export const RESOURCE_I18N_KEYS = {
  dashboard: "dashboard",
  people: "people",
  "waiting-list": "waitingList",
  "mailing-lists": "mailingLists",
  events: "events",
  sponsors: "sponsors",
  payments: "payments",
  reports: "reports",
  "audit-logs": "auditLogs",
  "app-settings": "appSettings",
  camp: "camp",
  sponsorships: "sponsorships",
  profile: "profile",
} as const;

export type AppResourceName = keyof typeof RESOURCE_I18N_KEYS;

export function resourceI18nKey(resource: string) {
  return RESOURCE_I18N_KEYS[resource as AppResourceName] ?? resource;
}
