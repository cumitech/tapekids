import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import { USER_ROLES, type UserRole } from "@/constants/user-roles";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare role: UserRole;
  declare verified: CreationOptional<boolean>;
  declare sessionVersion: CreationOptional<number>;
  declare personId: CreationOptional<string | null>;
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(128),
        unique: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: USER_ROLES.GUEST,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sessionVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
}
