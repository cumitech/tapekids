export const EVENT_TYPES = {
  CAMP: "camp",
  DAY_EVENT: "day_event",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export const EVENT_TYPE_VALUES = Object.values(EVENT_TYPES);

export function isEventType(value: unknown): value is EventType {
  return EVENT_TYPE_VALUES.includes(value as EventType);
}
