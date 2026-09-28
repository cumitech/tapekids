import { customAlphabet } from "nanoid";

import {
  PAYMENT_TRACKING_ALPHABET,
  PAYMENT_TRACKING_PREFIX,
  PAYMENT_TRACKING_SUFFIX_LENGTH,
  RECORD_ID_ALPHABET,
  RECORD_ID_LENGTH,
  TOKEN_ID_LENGTH,
} from "@/constants/ids";

const createRecordId = customAlphabet(RECORD_ID_ALPHABET, RECORD_ID_LENGTH);
const createTokenId = customAlphabet(RECORD_ID_ALPHABET, TOKEN_ID_LENGTH);
const createPaymentTrackingSuffix = customAlphabet(
  PAYMENT_TRACKING_ALPHABET,
  PAYMENT_TRACKING_SUFFIX_LENGTH
);

export function nanoid(size = RECORD_ID_LENGTH): string {
  if (size === RECORD_ID_LENGTH) {
    return createRecordId();
  }
  if (size === TOKEN_ID_LENGTH) {
    return createTokenId();
  }
  return customAlphabet(RECORD_ID_ALPHABET, size)();
}

export function tokenId(): string {
  return createTokenId();
}

/** Unique payment tracking id, separate from the internal record id. */
export function paymentTrackingId(): string {
  return `${PAYMENT_TRACKING_PREFIX}${createPaymentTrackingSuffix()}`;
}
