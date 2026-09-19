import { customAlphabet } from "nanoid";

import { RECORD_ID_LENGTH, TOKEN_ID_LENGTH } from "@/constants/ids";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function nanoid(size = RECORD_ID_LENGTH): string {
  return customAlphabet(alphabet, size)();
}

export function tokenId(): string {
  return nanoid(TOKEN_ID_LENGTH);
}
