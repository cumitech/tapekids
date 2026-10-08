import { Op, type Order, type WhereOptions } from "sequelize";

import { INVITATION_STATUSES } from "@/constants/event-participation";
import { Event, Invitation, InvitationBatch, Person } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";

export type TrophyStatsResult = {
  registered: number;
  invitationsSent: number;
  uniquePeople: number;
};

export class TrophyRepository {
  async listAccepted(query: ListQuery): Promise<PaginatedResult<Invitation>> {
    const personSearch = listSearchWhere(
      { ...query, eq: undefined, likes: undefined },
      ["fullName", "email", "phone", "yfId"]
    );

    const where: WhereOptions = {
      status: INVITATION_STATUSES.ACCEPTED,
    };

    const { rows, count } = await Invitation.findAndCountAll({
      where,
      include: [
        {
          model: Person,
          as: "person",
          required: Boolean(personSearch),
          where: personSearch,
        },
        {
          model: Event,
          as: "event",
          required: false,
        },
        {
          model: InvitationBatch,
          as: "batch",
          required: false,
        },
      ],
      offset: query.offset,
      limit: query.limit,
      order: trophyListOrder(query),
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }

  async listAllAccepted(): Promise<Invitation[]> {
    return Invitation.findAll({
      where: {
        status: INVITATION_STATUSES.ACCEPTED,
      },
      include: [
        {
          model: Person,
          as: "person",
          required: true,
        },
        {
          model: Event,
          as: "event",
          required: false,
        },
        {
          model: InvitationBatch,
          as: "batch",
          required: false,
        },
      ],
      order: [
        [{ model: Person, as: "person" }, "fullName", "ASC"],
        ["acceptedAt", "DESC"],
      ],
    });
  }

  async stats(): Promise<TrophyStatsResult> {
    const [registered, invitationsSent, uniquePeople] = await Promise.all([
      Invitation.count({
        where: { status: INVITATION_STATUSES.ACCEPTED },
      }),
      Invitation.count({
        where: {
          status: {
            [Op.in]: [INVITATION_STATUSES.SENT, INVITATION_STATUSES.ACCEPTED],
          },
        },
      }),
      Invitation.count({
        where: { status: INVITATION_STATUSES.ACCEPTED },
        distinct: true,
        col: "personId",
      }),
    ]);

    return {
      registered,
      invitationsSent,
      uniquePeople,
    };
  }
}

function trophyListOrder(query: ListQuery): Order {
  const sort = query.sort;
  if (sort === "fullName" || sort === "email" || sort === "yfId") {
    return [[{ model: Person, as: "person" }, sort, query.order]];
  }
  if (sort === "eventTitle" || sort === "event") {
    return [[{ model: Event, as: "event" }, "title", query.order]];
  }
  if (sort === "sentAt") {
    return [["sentAt", query.order]];
  }
  if (sort === "acceptedAt" || sort === "registeredAt") {
    return [["acceptedAt", query.order]];
  }
  return [
    ["acceptedAt", "DESC"],
    ["createdAt", "DESC"],
  ];
}
