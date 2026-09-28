/** Smallest sponsorship CamPay will start, in XAF. */
export const SPONSOR_AMOUNT_XAF = 5000;

export function acceptedSponsorAmount(value: unknown): number | null {
  const amount =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isInteger(amount) || amount < SPONSOR_AMOUNT_XAF) {
    return null;
  }
  return amount;
}
