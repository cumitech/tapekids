import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class AuditLog extends Model<
  InferAttributes<AuditLog>,
  InferCreationAttributes<AuditLog>
> {
  declare id: string;
  declare actorId: CreationOptional<string | null>;
  declare action: string;
  declare entity: string;
  declare entityId: CreationOptional<string | null>;
  declare changes: CreationOptional<Record<string, unknown> | null>;
  declare metadata: CreationOptional<Record<string, unknown> | null>;
}

export function initAuditLog(sequelize: Sequelize) {
  AuditLog.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      actorId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      entity: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      changes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "audit_logs",
      timestamps: true,
      updatedAt: false,
    }
  );

  return AuditLog;
}
