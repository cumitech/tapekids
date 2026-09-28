export const RECORD_ID_LENGTH = 20;
export const TOKEN_ID_LENGTH = 48;

/** URL-safe nanoid alphabet without `-` / `_`, so IDs stay inside STRING(20). */
export const RECORD_ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Human-readable payment ids, e.g. `PAY7K2M9Q4HX`. No `0/O/1/I`. */
export const PAYMENT_TRACKING_PREFIX = "PAY";
export const PAYMENT_TRACKING_SUFFIX_LENGTH = 9;
export const PAYMENT_TRACKING_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
