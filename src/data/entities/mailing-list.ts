import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import type { MailingListAudienceKind } from "@/constants/event-participation";
import { MAILING_LIST_AUDIENCE_KINDS } from "@/constants/event-participation";

export class MailingList extends Model<
  InferAttributes<MailingList>,
  InferCreationAttributes<MailingList>
> {
  declare id: string;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare audienceKind: MailingListAudienceKind;
  declare createdById: string;
}

export function initMailingList(sequelize: Sequelize) {
  MailingList.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      audienceKind: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: MAILING_LIST_AUDIENCE_KINDS.MIXED,
      },
      createdById: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "mailing_lists",
      timestamps: true,
    }
  );

  return MailingList;
}
