/** Smallest sponsorship CamPay will start, in XAF. */
export const SPONSOR_AMOUNT_XAF = 5000;

export function latestCreatedEventId(
  events: { id: string; createdAt?: string | Date | null }[]
): string {
  let latest: { id: string; at: number } | null = null;
  for (const event of events) {
    const parsed = event.createdAt ? Date.parse(String(event.createdAt)) : 0;
    const at = Number.isFinite(parsed) ? parsed : 0;
    if (!latest || at > latest.at) {
      latest = { id: event.id, at };
    }
  }
  return latest?.id ?? "";
}

export function acceptedSponsorAmount(value: unknown): number | null {
  const amount =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isInteger(amount) || amount < SPONSOR_AMOUNT_XAF) {
    return null;
  }
  return amount;
}
