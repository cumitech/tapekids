export const AUTH_TOKEN_PURPOSES = {
  VERIFY_EMAIL: "verify-email",
  RESET_PASSWORD: "reset-password",
} as const;

export type AuthTokenPurpose =
  (typeof AUTH_TOKEN_PURPOSES)[keyof typeof AUTH_TOKEN_PURPOSES];
