import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export const WAITING_LIST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
} as const;

export type WaitingListStatus =
  (typeof WAITING_LIST_STATUS)[keyof typeof WAITING_LIST_STATUS];

export class WaitingListEntry extends Model<
  InferAttributes<WaitingListEntry>,
  InferCreationAttributes<WaitingListEntry>
> {
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare phone: CreationOptional<string | null>;
  declare details: CreationOptional<Record<string, unknown> | null>;
  declare status: CreationOptional<WaitingListStatus>;
  declare personId: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initWaitingList(sequelize: Sequelize) {
  WaitingListEntry.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: WAITING_LIST_STATUS.PENDING,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "waiting_list",
      timestamps: true,
    }
  );

  return WaitingListEntry;
}
