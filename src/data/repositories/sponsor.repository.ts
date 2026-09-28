import type { InferCreationAttributes } from "sequelize";

import { Event, Payment, Person, Sponsor } from "@/data/entities";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

const INCLUDE = [
  { model: Person, as: "person" as const },
  { model: Event, as: "event" as const },
  { model: Payment, as: "payment" as const },
];

export class SponsorRepository {
  create(payload: InferCreationAttributes<Sponsor>) {
    return Sponsor.create(payload);
  }

  async findById(id: string): Promise<Sponsor> {
    const sponsor = await Sponsor.findByPk(id, { include: INCLUDE });
    if (!sponsor) {
      throw new NotFoundException("Sponsor", id);
    }
    return sponsor;
  }

  async list(query: ListQuery): Promise<PaginatedResult<Sponsor>> {
    const { rows, count } = await Sponsor.findAndCountAll({
      include: INCLUDE,
      offset: query.offset,
      limit: query.limit,
      order: [
        [query.sort === "updatedAt" ? "updatedAt" : "createdAt", query.order],
      ],
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }
}
