import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class AppSetting extends Model<
  InferAttributes<AppSetting>,
  InferCreationAttributes<AppSetting>
> {
  declare key: string;
  declare value: string;
}

export function initAppSetting(sequelize: Sequelize) {
  AppSetting.init(
    {
      key: {
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "app_settings",
      timestamps: true,
    }
  );

  return AppSetting;
}
