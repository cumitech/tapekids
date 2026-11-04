import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
  type Sequelize,
} from "sequelize";

import type { PersonCategory } from "@/constants/person";
import type { MailingList } from "@/data/entities/mailing-list";

export class PeopleImportBatch extends Model<
  InferAttributes<PeopleImportBatch>,
  InferCreationAttributes<PeopleImportBatch>
> {
  declare id: string;
  declare category: PersonCategory;
  declare importedAt: Date;
  declare fileName: string;
  declare created: number;
  declare updated: number;
  declare unchanged: number;
  declare skipped: number;
  declare mailingListId: CreationOptional<string | null>;
  declare mailingList?: NonAttribute<MailingList | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initPeopleImportBatch(sequelize: Sequelize) {
  PeopleImportBatch.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      category: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      importedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      created: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      updated: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      unchanged: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      skipped: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      mailingListId: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "people_import_batches",
      timestamps: true,
    }
  );

  return PeopleImportBatch;
}
