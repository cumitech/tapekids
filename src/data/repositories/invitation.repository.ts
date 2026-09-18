import type { InferCreationAttributes } from "sequelize";

import type { InvitationStatus } from "@/constants/event-participation";
import { INVITATION_STATUSES } from "@/constants/event-participation";
import { Invitation, Person } from "@/data/entities";
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

  async listByBatch(batchId: string): Promise<Invitation[]> {
    return Invitation.findAll({
      where: { batchId },
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

  markSent(id: string, sentAt = new Date()) {
    return this.updateStatus(id, INVITATION_STATUSES.SENT, { sentAt });
  }

  markAccepted(id: string, acceptedAt = new Date()) {
    return this.updateStatus(id, INVITATION_STATUSES.ACCEPTED, { acceptedAt });
  }
}
