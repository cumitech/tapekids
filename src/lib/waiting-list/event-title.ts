import type { WaitingListEntry } from "@/models/waiting-list/waiting-list.model";

export function waitingListEventTitle(row: WaitingListEntry): string {
  const details = row.details;
  if (!details) {
    return "";
  }
  if (typeof details === "string") {
    try {
      return waitingListEventTitle({
        ...row,
        details: JSON.parse(details) as WaitingListEntry["details"],
      });
    } catch {
      return "";
    }
  }
  return typeof details.eventTitle === "string" ? details.eventTitle : "";
}
