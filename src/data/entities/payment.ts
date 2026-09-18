import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import type { PaymentKind, PaymentStatus } from "@/constants/event-participation";
import type { Event } from "./event";
import type { Person } from "./person";
import { PAYMENT_KINDS, PAYMENT_STATUSES } from "@/constants/event-participation";

export class Payment extends Model<
  InferAttributes<Payment>,
  InferCreationAttributes<Payment>
> {
  declare id: string;
  declare eventId: string;
  declare personId: string;
  declare kind: PaymentKind;
  declare amount: string;
  declare currency: CreationOptional<string>;
  declare status: PaymentStatus;
  declare providerRef: CreationOptional<string | null>;
  declare event?: Event;
  declare person?: Person;
}

export function initPayment(sequelize: Sequelize) {
  Payment.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      eventId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      kind: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: PAYMENT_KINDS.PARTICIPANT_FEE,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "XAF",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: PAYMENT_STATUSES.PENDING,
      },
      providerRef: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "payments",
      timestamps: true,
    }
  );

  return Payment;
}
