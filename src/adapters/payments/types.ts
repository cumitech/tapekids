export type CollectInput = {
  amount: number;
  currency: string;
  from: string;
  description: string;
  externalReference: string;
};

export type PaymentLinkInput = {
  amount: number;
  currency: string;
  description: string;
  externalReference: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  redirectUrl: string;
};

export type ProviderChargeResult = {
  reference: string;
  status: string;
  ussdCode?: string;
  operator?: string;
  link?: string;
};

export type PaymentAdapter = {
  collect(input: CollectInput): Promise<ProviderChargeResult>;
  createPaymentLink(input: PaymentLinkInput): Promise<ProviderChargeResult>;
  getStatus(reference: string): Promise<{ status: string; reference: string }>;
};
