export const CAMPAY_HOSTS = {
  DEV: "https://demo.campay.net",
  PROD: "https://www.campay.net",
} as const;

export const CAMPAY_PATHS = {
  token: "/token/",
  collect: "/collect/",
  paymentLink: "/get_payment_link/",
  transaction: (reference: string) =>
    `/transaction/${encodeURIComponent(reference)}/`,
} as const;

export const CAMPAY_PAYMENT_OPTIONS = "MOMO" as const;
