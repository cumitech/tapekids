import { Op } from "sequelize";

import { PasswordReset } from "@/data/entities";
import { NotFoundException } from "@/exceptions/not-found.exception";

export class PasswordResetRepository {
  async create(payload: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt?: Date | null;
  }): Promise<PasswordReset> {
    return PasswordReset.create(payload);
  }

  async findValid(tokenHash: string): Promise<PasswordReset> {
    const reset = await PasswordReset.findOne({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
    if (!reset) {
      throw new NotFoundException("PasswordReset", tokenHash);
    }
    return reset;
  }

  async markUsed(id: string): Promise<void> {
    await PasswordReset.update({ usedAt: new Date() }, { where: { id } });
  }
}
