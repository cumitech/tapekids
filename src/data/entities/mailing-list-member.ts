import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class MailingListMember extends Model<
  InferAttributes<MailingListMember>,
  InferCreationAttributes<MailingListMember>
> {
  declare id: string;
  declare mailingListId: string;
  declare personId: string;
}

export function initMailingListMember(sequelize: Sequelize) {
  MailingListMember.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      mailingListId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      personId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "mailing_list_members",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["mailingListId", "personId"],
          name: "mailing_list_members_list_person",
        },
      ],
    }
  );

  return MailingListMember;
}
