import { Op } from "sequelize";

import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_STATUSES,
  MEMBERSHIP_STATUSES,
} from "@/constants/event-participation";
import {
  PERSON_CATEGORIES,
  type PersonCategory,
} from "@/constants/person";
import { REPORT_KINDS, reportPersonCategory } from "@/constants/reports";
import { EventMembership, Invitation, Person } from "@/data/entities";

export type TrophyStatsResult = {
  registered: number;
  invitationsSent: number;
  uniquePeople: number;
};

const TROPHY_PARTICIPANT_CATEGORY = reportPersonCategory(
  REPORT_KINDS.TROPHY_PARTICIPANTS
);
const TROPHY_CATEGORIES: PersonCategory[] = [
  PERSON_CATEGORIES.TROPHY_CAMPER,
  PERSON_CATEGORIES.TROPHY_PARTICIPANT,
];

export class TrophyRepository {
  async stats(): Promise<TrophyStatsResult> {
    const [uniquePeople, invitationsSent] = await Promise.all([
      this.countUniqueRegisteredPeople([TROPHY_PARTICIPANT_CATEGORY]),
      Invitation.count({
        where: {
          status: {
            [Op.in]: [INVITATION_STATUSES.SENT, INVITATION_STATUSES.ACCEPTED],
          },
        },
        include: [this.trophyPeopleInclude([TROPHY_PARTICIPANT_CATEGORY])],
      }),
    ]);

    return {
      registered: uniquePeople,
      invitationsSent,
      uniquePeople,
    };
  }

  countUniqueRegisteredPeople(categories: PersonCategory[] = TROPHY_CATEGORIES) {
    return EventMembership.count({
      where: {
        kind: EVENT_MEMBERSHIP_KINDS.CAMPER,
        status: MEMBERSHIP_STATUSES.REGISTERED,
      },
      include: [this.trophyPeopleInclude(categories)],
      distinct: true,
      col: "personId",
    });
  }

  private trophyPeopleInclude(categories: PersonCategory[]) {
    return {
      model: Person,
      as: "person" as const,
      required: true,
      attributes: [],
      where: { category: { [Op.in]: categories } },
    };
  }
}
