import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
  type Sequelize,
} from "sequelize";

import type { Event } from "./event";
import type { Payment } from "./payment";
import type { Person } from "./person";

export class Sponsor extends Model<
  InferAttributes<Sponsor>,
  InferCreationAttributes<Sponsor>
> {
  declare id: string;
  declare personId: string;
  declare eventId: string;
  declare anonymous: CreationOptional<boolean>;
  declare paymentPhone: string;
  declare paymentId: CreationOptional<string | null>;
  declare person?: NonAttribute<Person>;
  declare event?: NonAttribute<Event>;
  declare payment?: NonAttribute<Payment>;
}

export function initSponsor(sequelize: Sequelize) {
  Sponsor.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      eventId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      anonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      paymentPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      paymentId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sponsors",
      timestamps: true,
    }
  );

  return Sponsor;
}
