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
  InvitationStatus,
} from "@/constants/event-participation";
import {
  EVENT_MEMBERSHIP_KINDS,
  INVITATION_STATUSES,
} from "@/constants/event-participation";
import type { Person } from "./person";

export class Invitation extends Model<
  InferAttributes<Invitation>,
  InferCreationAttributes<Invitation>
> {
  declare id: string;
  declare batchId: string;
  declare eventId: string;
  declare personId: string;
  declare kind: EventMembershipKind;
  declare token: string;
  declare emailSnapshot: string;
  declare status: InvitationStatus;
  declare sentAt: CreationOptional<Date | null>;
  declare acceptedAt: CreationOptional<Date | null>;
  declare expiresAt: CreationOptional<Date | null>;
  declare person?: NonAttribute<Person>;
}

export function initInvitation(sequelize: Sequelize) {
  Invitation.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      batchId: {
        type: DataTypes.STRING(20),
        allowNull: false,
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
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: EVENT_MEMBERSHIP_KINDS.CAMPER,
      },
      token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      emailSnapshot: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: INVITATION_STATUSES.QUEUED,
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      acceptedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "invitations",
      timestamps: true,
      indexes: [
        {
          fields: ["eventId", "personId", "kind"],
          name: "invitations_event_person_kind",
        },
      ],
    }
  );

  return Invitation;
}
