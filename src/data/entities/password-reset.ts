import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import { AUTH_TOKEN_PURPOSES, type AuthTokenPurpose } from "@/constants/auth-tokens";

export class PasswordReset extends Model<
  InferAttributes<PasswordReset>,
  InferCreationAttributes<PasswordReset>
> {
  declare id: string;
  declare userId: string;
  declare tokenHash: string;
  declare purpose: CreationOptional<AuthTokenPurpose>;
  declare expiresAt: Date;
  declare usedAt: CreationOptional<Date | null>;
}

export function initPasswordReset(sequelize: Sequelize) {
  PasswordReset.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      purpose: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: AUTH_TOKEN_PURPOSES.RESET_PASSWORD,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "password_resets",
      timestamps: true,
      updatedAt: false,
    }
  );

  return PasswordReset;
}
