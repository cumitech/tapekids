export const EVENT_MEMBERSHIP_KINDS = {
  CAMPER: "camper",
  COORDINATOR: "coordinator",
  SPONSOR: "sponsor",
} as const;

export type EventMembershipKind =
  (typeof EVENT_MEMBERSHIP_KINDS)[keyof typeof EVENT_MEMBERSHIP_KINDS];

export const CAMP_PORTAL_KINDS: EventMembershipKind[] = [
  EVENT_MEMBERSHIP_KINDS.CAMPER,
  EVENT_MEMBERSHIP_KINDS.COORDINATOR,
];

export const SPONSOR_PORTAL_KINDS: EventMembershipKind[] = [
  EVENT_MEMBERSHIP_KINDS.SPONSOR,
];

export const MAILING_LIST_AUDIENCE_KINDS = {
  ...EVENT_MEMBERSHIP_KINDS,
  MIXED: "mixed",
} as const;

export type MailingListAudienceKind =
  (typeof MAILING_LIST_AUDIENCE_KINDS)[keyof typeof MAILING_LIST_AUDIENCE_KINDS];

export const MEMBERSHIP_STATUSES = {
  INVITED: "invited",
  REGISTERED: "registered",
  CANCELLED: "cancelled",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUSES)[keyof typeof MEMBERSHIP_STATUSES];

export const INVITATION_BATCH_STATUSES = {
  DRAFT: "draft",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type InvitationBatchStatus =
  (typeof INVITATION_BATCH_STATUSES)[keyof typeof INVITATION_BATCH_STATUSES];

export const INVITATION_STATUSES = {
  QUEUED: "queued",
  SENT: "sent",
  FAILED: "failed",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
} as const;

export type InvitationStatus =
  (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];

export const PAYMENT_KINDS = {
  PARTICIPANT_FEE: "participant_fee",
  COORDINATOR_FUND: "coordinator_fund",
  SPONSOR_FUND: "sponsor_fund",
} as const;

export type PaymentKind = (typeof PAYMENT_KINDS)[keyof typeof PAYMENT_KINDS];

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  WAIVED: "waived",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
