import { Op } from "sequelize";

import { AUTH_TOKEN_PURPOSES, type AuthTokenPurpose } from "@/constants/auth-tokens";
import { PasswordReset } from "@/data/entities";
import { NotFoundException } from "@/exceptions/not-found.exception";

export class PasswordResetRepository {
  async create(payload: {
    id: string;
    userId: string;
    tokenHash: string;
    purpose?: AuthTokenPurpose;
    expiresAt: Date;
    usedAt?: Date | null;
  }): Promise<PasswordReset> {
    return PasswordReset.create(payload);
  }

  async findValid(
    tokenHash: string,
    purpose: AuthTokenPurpose = AUTH_TOKEN_PURPOSES.RESET_PASSWORD
  ): Promise<PasswordReset> {
    const reset = await PasswordReset.findOne({
      where: {
        tokenHash,
        purpose,
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
