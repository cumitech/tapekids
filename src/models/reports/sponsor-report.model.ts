import type { MembershipStatus } from "@/constants/event-participation";
import type { PersonCategory } from "@/constants/person";

export type SponsorReportRow = {
  id: string;
  personId: string;
  eventId: string;
  eventTitle: string;
  status: MembershipStatus;
  yfId?: string | null;
  fullName: string;
  email?: string | null;
  gender?: string | null;
  shirtSize?: string | null;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  region?: string | null;
  town?: string | null;
  address?: string | null;
  category?: PersonCategory | null;
  points?: number | null;
  ageYears?: number | null;
};
