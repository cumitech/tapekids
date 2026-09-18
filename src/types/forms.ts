export type GuardianFormValue = {
  name: string;
  phone: string;
};

export type PersonFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
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
};

export type EventFormValues = {
  translations: {
    en: {
      title: string;
      summary: string;
      description: string;
      venue: string;
    };
    fr: {
      title: string;
      summary: string;
      description: string;
      venue: string;
    };
  };
  city: string;
  startsAt: string;
  endsAt: string;
  requiresParticipantFee: boolean;
  participantFeeAmount: string;
  currency: string;
  coordinatorFundAmount: string;
  sponsorFundAmount: string;
  imageUrl: string;
  isPublished: boolean;
};

export type MailingListFormValues = {
  translations: {
    en: { name: string; description: string };
    fr: { name: string; description: string };
  };
  audienceKind: "camper" | "coordinator" | "sponsor" | "mixed";
  personIds: string[];
};
