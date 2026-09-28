export interface PaymentPerson {
  id?: string;
  fullName?: string;
  email?: string;
}

export interface PaymentEvent {
  id: string;
  title?: string;
}

export interface Payment {
  id: string;
  eventId: string;
  personId: string;
  kind: string;
  amount: string;
  currency: string;
  status: string;
  trackingId: string;
  providerRef?: string | null;
  createdAt?: string | null;
  person?: PaymentPerson;
  event?: PaymentEvent;
}
