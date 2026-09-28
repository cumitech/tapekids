import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

import type { PersonCategory } from "@/constants/person";

export class Person extends Model<
  InferAttributes<Person>,
  InferCreationAttributes<Person>
> {
  declare id: string;
  declare fullName: string;
  declare email: CreationOptional<string | null>;
  declare phone: CreationOptional<string | null>;
  declare dateOfBirth: CreationOptional<Date | null>;
  declare gender: CreationOptional<string | null>;
  declare shirtSize: CreationOptional<string | null>;
  declare address: CreationOptional<string | null>;
  declare churchName: CreationOptional<string | null>;
  declare churchPastorName: CreationOptional<string | null>;
  declare churchAddress: CreationOptional<string | null>;
  declare country: CreationOptional<string | null>;
  declare town: CreationOptional<string | null>;
  declare region: CreationOptional<string | null>;
  declare division: CreationOptional<string | null>;
  declare subDivision: CreationOptional<string | null>;
  declare parentGuardianName: CreationOptional<string | null>;
  declare parentGuardianPhone: CreationOptional<string | null>;
  declare medicalNotes: CreationOptional<string | null>;
  declare yfId: CreationOptional<string | null>;
  declare points: CreationOptional<number | null>;
  declare ageYears: CreationOptional<number | null>;
  declare isTrophy: CreationOptional<boolean>;
  declare category: CreationOptional<PersonCategory | null>;
}

export function initPerson(sequelize: Sequelize) {
  Person.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING(16),
        allowNull: true,
      },
      shirtSize: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      churchName: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      churchPastorName: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      churchAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      town: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      region: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      division: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      subDivision: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      parentGuardianName: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      parentGuardianPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      medicalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      yfId: {
        type: DataTypes.STRING(32),
        allowNull: true,
        unique: true,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ageYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isTrophy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      category: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "people",
      timestamps: true,
    }
  );

  return Person;
}
