export type GuardianFormValue = {
  name: string;
  phone: string;
};

export type PersonFormValues = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  shirtSize: string;
  address: string;
  churchName: string;
  churchPastorName: string;
  churchAddress: string;
  country: string;
  town: string;
  region: string;
  division: string;
  subDivision: string;
  guardians: GuardianFormValue[];
  medicalNotes: string;
  yfId: string;
  points: string;
  ageYears: string;
  isTrophy: boolean;
  category: string;
};

export type EventFormValues = {
  translations: {
    fr: {
      title: string;
      summary: string;
      description: string;
      venue: string;
    };
    en: {
      title: string;
      summary: string;
      description: string;
      venue: string;
    };
  };
  city: string;
  startsAt: string;
  endsAt: string;
  eventType: "camp" | "day_event";
  requiresParticipantFee: boolean;
  participantFeeAmount: string;
  currency: string;
  coordinatorFundAmount: string;
  sponsorFundAmount: string;
  imageUrl: string;
  minAge: string;
  maxAge: string;
  isPublished: boolean;
};

export type MailingListFormValues = {
  translations: {
    fr: { name: string; description: string };
    en: { name: string; description: string };
  };
  audienceKind: "camper" | "coordinator" | "sponsor" | "mixed";
  personIds: string[];
};
