import { Op, fn, col, type InferCreationAttributes } from "sequelize";

import type { InvitationStatus } from "@/constants/event-participation";
import { INVITATION_STATUSES } from "@/constants/event-participation";
import { Event, Invitation, InvitationBatch, Person } from "@/data/entities";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type InvitationCreatePayload = InferCreationAttributes<Invitation>;

const PERSON_INCLUDE = [{ model: Person, as: "person" as const }];

export class InvitationRepository {
  async create(payload: InvitationCreatePayload): Promise<Invitation> {
    return Invitation.create(payload);
  }

  async createMany(payloads: InvitationCreatePayload[]): Promise<Invitation[]> {
    if (payloads.length === 0) {
      return [];
    }
    return Invitation.bulkCreate(payloads);
  }

  async findById(id: string): Promise<Invitation> {
    const invitation = await Invitation.findByPk(id, {
      include: PERSON_INCLUDE,
    });
    if (!invitation) {
      throw new NotFoundException("Invitation", id);
    }
    return invitation;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    return Invitation.findOne({
      where: { token },
      include: PERSON_INCLUDE,
    });
  }

  async listForSettings(): Promise<Invitation[]> {
    return Invitation.findAll({
      include: [
        {
          model: Person,
          as: "person",
          attributes: ["id", "fullName", "email"],
        },
        { model: Event, as: "event", attributes: ["id", "title"] },
        {
          model: InvitationBatch,
          as: "batch",
          attributes: ["id", "subject", "linksOpen"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async setExpiresAt(id: string, expiresAt: Date): Promise<Invitation> {
    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundException("Invitation", id);
    }
    await invitation.update({ expiresAt });
    return this.findById(id);
  }

  async setLinksOpen(id: string, linksOpen: boolean): Promise<Invitation> {
    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundException("Invitation", id);
    }
    await invitation.update({ linksOpen });
    return this.findById(id);
  }

  async listByBatch(batchId: string): Promise<Invitation[]> {
    return Invitation.findAll({
      where: { batchId },
      include: PERSON_INCLUDE,
      order: [["createdAt", "ASC"]],
    });
  }

  async listByPersonStatus(
    personId: string,
    status: InvitationStatus
  ): Promise<Invitation[]> {
    return Invitation.findAll({
      where: { personId, status },
      include: PERSON_INCLUDE,
      order: [["createdAt", "ASC"]],
    });
  }

  async updateStatus(
    id: string,
    status: InvitationStatus,
    extra: Partial<Pick<Invitation, "sentAt" | "acceptedAt">> = {}
  ): Promise<Invitation> {
    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundException("Invitation", id);
    }
    await invitation.update({ status, ...extra });
    return this.findById(id);
  }

  markFailed(id: string) {
    return this.updateStatus(id, INVITATION_STATUSES.FAILED);
  }

  async updateEmailSnapshot(id: string, emailSnapshot: string): Promise<void> {
    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      throw new NotFoundException("Invitation", id);
    }
    await invitation.update({ emailSnapshot });
  }

  async countByBatches(batchIds: string[]) {
    if (batchIds.length === 0) {
      return [];
    }
    const rows = await Invitation.findAll({
      attributes: [
        "batchId",
        "status",
        [fn("COUNT", col("id")), "total"],
      ],
      where: { batchId: { [Op.in]: batchIds } },
      group: ["batchId", "status"],
      raw: true,
    });
    return rows as unknown as Array<{
      batchId: string;
      status: string;
      total: string | number;
    }>;
  }

  markSent(id: string, sentAt = new Date()) {
    return this.updateStatus(id, INVITATION_STATUSES.SENT, { sentAt });
  }

  markAccepted(id: string, acceptedAt = new Date()) {
    return this.updateStatus(id, INVITATION_STATUSES.ACCEPTED, { acceptedAt });
  }
}
