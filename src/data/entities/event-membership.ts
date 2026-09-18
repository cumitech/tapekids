import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import type {
  EventMembershipKind,
  MembershipStatus,
} from "@/constants/event-participation";
import type { Event } from "./event";
import type { Person } from "./person";
import {
  EVENT_MEMBERSHIP_KINDS,
  MEMBERSHIP_STATUSES,
} from "@/constants/event-participation";

export class EventMembership extends Model<
  InferAttributes<EventMembership>,
  InferCreationAttributes<EventMembership>
> {
  declare id: string;
  declare eventId: string;
  declare personId: string;
  declare kind: EventMembershipKind;
  declare status: MembershipStatus;
  declare event?: Event;
  declare person?: Person;
}

export function initEventMembership(sequelize: Sequelize) {
  EventMembership.init(
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
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: EVENT_MEMBERSHIP_KINDS.CAMPER,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: MEMBERSHIP_STATUSES.INVITED,
      },
    },
    {
      sequelize,
      tableName: "event_memberships",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["eventId", "personId", "kind"],
          name: "event_memberships_event_person_kind",
        },
      ],
    }
  );

  return EventMembership;
}
