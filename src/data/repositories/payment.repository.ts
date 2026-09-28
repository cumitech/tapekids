import { Op, type InferCreationAttributes, type WhereOptions } from "sequelize";

import type { PaymentKind } from "@/constants/event-participation";
import { PAYMENT_STATUSES } from "@/constants/event-participation";
import { Event, Payment, Person } from "@/data/entities";
import { listSearchWhere } from "@/data/list-where";
import type { ListQuery, PaginatedResult } from "@/data/types/pagination";
import { NotFoundException } from "@/exceptions/not-found.exception";
import { paymentTrackingId } from "@/lib/api/id";

export type PaymentCreatePayload = InferCreationAttributes<Payment>;
export type PaymentUpdatePayload = Partial<
  Omit<PaymentCreatePayload, "id" | "eventId" | "personId" | "trackingId">
>;

const PAYMENT_INCLUDE = [
  { model: Person, as: "person" as const },
  { model: Event, as: "event" as const },
];

export class PaymentRepository {
  async create(payload: PaymentCreatePayload): Promise<Payment> {
    let trackingId = payload.trackingId || paymentTrackingId();
    let lastError: unknown;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await Payment.create({ ...payload, trackingId });
      } catch (error) {
        lastError = error;
        if (!isTrackingIdCollision(error)) {
          throw error;
        }
        trackingId = paymentTrackingId();
      }
    }

    throw lastError;
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
    const search = listSearchWhere(query, [
      "trackingId",
      "providerRef",
      "status",
      "kind",
    ]);
    const hasWhere = Object.keys(where).length > 0;
    const combined = search && hasWhere ? { [Op.and]: [where, search] } : search || where;
    const { rows, count } = await Payment.findAndCountAll({
      where: combined,
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

  list(query: ListQuery) {
    return this.paginate({}, query);
  }

  listByEvent(eventId: string, query: ListQuery) {
    return this.paginate({ eventId }, query);
  }

  listByPerson(personId: string, query: ListQuery) {
    return this.paginate({ personId }, query);
  }

  listRecentByPerson(personId: string, limit = 100) {
    return Payment.findAll({
      where: { personId },
      attributes: ["id", "eventId", "kind", "amount", "currency", "status"],
      order: [["createdAt", "DESC"]],
      limit,
    });
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
        [Op.or]: [
          { id: reference },
          { trackingId: reference },
          { providerRef: reference },
        ],
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

function isTrackingIdCollision(error: unknown) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("name" in error) ||
    (error as { name: string }).name !== "SequelizeUniqueConstraintError"
  ) {
    return false;
  }

  const fields = (error as { fields?: Record<string, unknown> }).fields;
  if (fields && "trackingId" in fields) {
    return true;
  }

  const details = (error as { errors?: { path?: string }[] }).errors;
  return details?.some((item) => item.path === "trackingId") ?? false;
}
