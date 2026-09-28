import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
  type Sequelize,
} from "sequelize";

import type {
  EventMembershipKind,
  InvitationBatchStatus,
} from "@/constants/event-participation";
import type { Event } from "./event";
import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_BATCH_STATUSES,
} from "@/constants/event-participation";

export class InvitationBatch extends Model<
  InferAttributes<InvitationBatch>,
  InferCreationAttributes<InvitationBatch>
> {
  declare id: string;
  declare eventId: string;
  declare mailingListId: CreationOptional<string | null>;
  declare kind: EventMembershipKind;
  declare subject: string;
  declare body: string;
  declare sentById: string;
  declare status: InvitationBatchStatus;
  declare linksOpen: CreationOptional<boolean>;
  declare sentAt: CreationOptional<Date | null>;
  declare event?: NonAttribute<Event>;
}

export function initInvitationBatch(sequelize: Sequelize) {
  InvitationBatch.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      eventId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      mailingListId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      kind: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: EVENT_MEMBERSHIP_KINDS.CAMPER,
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sentById: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: INVITATION_BATCH_STATUSES.DRAFT,
      },
      linksOpen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "invitation_batches",
      timestamps: true,
    }
  );

  return InvitationBatch;
}
