import { Op } from "sequelize";

import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_STATUSES,
  MEMBERSHIP_STATUSES,
} from "@/constants/event-participation";
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

export class TrophyRepository {
  async stats(): Promise<TrophyStatsResult> {
    const personInclude = {
      model: Person,
      as: "person" as const,
      required: true,
      attributes: [],
      where: { category: TROPHY_PARTICIPANT_CATEGORY },
    };

    const [registered, uniquePeople, invitationsSent] = await Promise.all([
      EventMembership.count({
        where: {
          kind: EVENT_MEMBERSHIP_KINDS.CAMPER,
          status: MEMBERSHIP_STATUSES.REGISTERED,
        },
        include: [personInclude],
        distinct: true,
      }),
      EventMembership.count({
        where: {
          kind: EVENT_MEMBERSHIP_KINDS.CAMPER,
          status: MEMBERSHIP_STATUSES.REGISTERED,
        },
        include: [personInclude],
        distinct: true,
        col: "personId",
      }),
      Invitation.count({
        where: {
          status: {
            [Op.in]: [INVITATION_STATUSES.SENT, INVITATION_STATUSES.ACCEPTED],
          },
        },
        include: [personInclude],
      }),
    ]);

    return {
      registered,
      invitationsSent,
      uniquePeople,
    };
  }
}
