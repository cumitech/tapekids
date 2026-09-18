import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class Event extends Model<
  InferAttributes<Event>,
  InferCreationAttributes<Event>
> {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare summary: string;
  declare description: string;
  declare venue: string;
  declare city: string;
  declare startsAt: Date;
  declare endsAt: CreationOptional<Date | null>;
  declare isPublished: CreationOptional<boolean>;
  declare requiresParticipantFee: CreationOptional<boolean>;
  declare participantFeeAmount: CreationOptional<string | null>;
  declare currency: CreationOptional<string>;
  declare coordinatorFundAmount: CreationOptional<string | null>;
  declare sponsorFundAmount: CreationOptional<string | null>;
  declare imageUrl: CreationOptional<string | null>;
  declare createdById: string;
}

export function initEvent(sequelize: Sequelize) {
  Event.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      summary: {
        type: DataTypes.STRING(280),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      venue: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      startsAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      requiresParticipantFee: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      participantFeeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "XAF",
      },
      coordinatorFundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      sponsorFundAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      createdById: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "events",
      timestamps: true,
    }
  );

  return Event;
}
