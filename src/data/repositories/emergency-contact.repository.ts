import type { InferCreationAttributes } from "sequelize";

import { EmergencyContact } from "@/data/entities";
import { sequelize } from "@/database/db-sequelize.config";
import { NotFoundException } from "@/exceptions/not-found.exception";

export type EmergencyContactCreatePayload =
  InferCreationAttributes<EmergencyContact>;

export class EmergencyContactRepository {
  async create(
    payload: EmergencyContactCreatePayload
  ): Promise<EmergencyContact> {
    return EmergencyContact.create(payload);
  }

  async findById(id: string): Promise<EmergencyContact> {
    const contact = await EmergencyContact.findByPk(id);
    if (!contact) {
      throw new NotFoundException("EmergencyContact", id);
    }
    return contact;
  }

  async listByPerson(personId: string): Promise<EmergencyContact[]> {
    return EmergencyContact.findAll({
      where: { personId },
      order: [["createdAt", "ASC"]],
    });
  }

  async replaceForPerson(
    personId: string,
    contacts: Array<Omit<EmergencyContactCreatePayload, "personId">>
  ): Promise<EmergencyContact[]> {
    const transaction = await sequelize.transaction();
    try {
      await EmergencyContact.destroy({ where: { personId }, transaction });
      if (contacts.length === 0) {
        await transaction.commit();
        return [];
      }
      const created = await EmergencyContact.bulkCreate(
        contacts.map((contact) => ({ ...contact, personId })),
        { transaction }
      );
      await transaction.commit();
      return created;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const contact = await EmergencyContact.findByPk(id);
    if (!contact) {
      throw new NotFoundException("EmergencyContact", id);
    }
    await contact.destroy();
  }
}
