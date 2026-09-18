import type {
  EventMembershipKind,
  MembershipStatus,
} from "@/constants/event-participation";
import type { UserRole } from "@/constants/user-roles";
import type { Event } from "@/models/events/event.model";
import type { Person } from "@/models/people/person.model";

export type MeUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  personId?: string | null;
};

export type MePaymentSummary = {
  id: string;
  eventId: string;
  kind: string;
  amount: string;
  currency: string;
  status: string;
};

export type MeMembership = {
  id: string;
  kind: EventMembershipKind;
  status: MembershipStatus;
  event: Pick<
    Event,
    | "id"
    | "title"
    | "slug"
    | "summary"
    | "description"
    | "venue"
    | "city"
    | "startsAt"
    | "endsAt"
    | "requiresParticipantFee"
    | "participantFeeAmount"
    | "currency"
    | "coordinatorFundAmount"
    | "sponsorFundAmount"
    | "imageUrl"
  > | null;
  payment: MePaymentSummary | null;
  dueAmount: number;
  currency: string;
};

export type MeProfile = {
  user: MeUser;
  person: Person | null;
  memberships: MeMembership[];
};
