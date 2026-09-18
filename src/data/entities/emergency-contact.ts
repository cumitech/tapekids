import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class EmergencyContact extends Model<
  InferAttributes<EmergencyContact>,
  InferCreationAttributes<EmergencyContact>
> {
  declare id: string;
  declare personId: string;
  declare name: string;
  declare phone: string;
  declare relation: string;
}

export function initEmergencyContact(sequelize: Sequelize) {
  EmergencyContact.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      relation: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "emergency_contacts",
      timestamps: true,
    }
  );

  return EmergencyContact;
}
