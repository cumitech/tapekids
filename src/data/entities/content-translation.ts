import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import type { AppLocale } from "@/constants/locales";
import type { ContentEntityType } from "@/constants/content-i18n";

export class ContentTranslation extends Model<
  InferAttributes<ContentTranslation>,
  InferCreationAttributes<ContentTranslation>
> {
  declare id: string;
  declare entityType: ContentEntityType;
  declare entityId: string;
  declare locale: AppLocale;
  declare field: string;
  declare value: string;
}

export function initContentTranslation(sequelize: Sequelize) {
  ContentTranslation.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      entityType: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      locale: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      field: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "content_translations",
      timestamps: true,
      indexes: [
        {
          unique: true,
          name: "content_translations_entity_locale_field",
          fields: ["entityType", "entityId", "locale", "field"],
        },
        {
          name: "content_translations_entity",
          fields: ["entityType", "entityId"],
        },
      ],
    }
  );

  return ContentTranslation;
}
