import { Op, type InferCreationAttributes, type WhereOptions } from "sequelize";

import type { PaymentKind } from "@/constants/event-participation";
import { PAYMENT_STATUSES } from "@/constants/event-participation";
import { Event, Payment, Person } from "@/data/entities";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type PaymentCreatePayload = InferCreationAttributes<Payment>;
export type PaymentUpdatePayload = Partial<
  Omit<PaymentCreatePayload, "id" | "eventId" | "personId">
>;

const PAYMENT_INCLUDE = [
  { model: Person, as: "person" as const },
  { model: Event, as: "event" as const },
];

export class PaymentRepository {
  async create(payload: PaymentCreatePayload): Promise<Payment> {
    return Payment.create(payload);
  }

  async findById(id: string): Promise<Payment> {
    const payment = await Payment.findByPk(id, { include: PAYMENT_INCLUDE });
    if (!payment) {
      throw new NotFoundException("Payment", id);
    }
    return payment;
  }

  private async paginate(
    where: WhereOptions<Payment>,
    query: ListQuery
  ): Promise<PaginatedResult<Payment>> {
    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: PAYMENT_INCLUDE,
      offset: query.offset,
      limit: query.limit,
      order: [[query.sort, query.order]],
    });

    return {
      data: rows,
      total: count,
      offset: query.offset,
      limit: query.limit,
    };
  }

  listByEvent(eventId: string, query: ListQuery) {
    return this.paginate({ eventId }, query);
  }

  listByPerson(personId: string, query: ListQuery) {
    return this.paginate({ personId }, query);
  }

  async findOpen(
    eventId: string,
    personId: string,
    kind: PaymentKind
  ): Promise<Payment | null> {
    return Payment.findOne({
      where: {
        eventId,
        personId,
        kind,
        status: {
          [Op.in]: [PAYMENT_STATUSES.PENDING, PAYMENT_STATUSES.PAID],
        },
      },
      order: [["createdAt", "DESC"]],
      include: PAYMENT_INCLUDE,
    });
  }

  async findByExternalReference(reference: string): Promise<Payment | null> {
    return Payment.findOne({
      where: {
        [Op.or]: [{ id: reference }, { providerRef: reference }],
      },
      include: PAYMENT_INCLUDE,
    });
  }

  async findPending(eventId?: string): Promise<Payment[]> {
    return Payment.findAll({
      where: {
        status: PAYMENT_STATUSES.PENDING,
        ...(eventId ? { eventId } : {}),
      },
      include: PAYMENT_INCLUDE,
    });
  }

  async update(id: string, payload: PaymentUpdatePayload): Promise<Payment> {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw new NotFoundException("Payment", id);
    }
    await payment.update(payload);
    return this.findById(id);
  }
}
