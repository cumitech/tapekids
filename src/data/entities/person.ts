import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";

export class Person extends Model<
  InferAttributes<Person>,
  InferCreationAttributes<Person>
> {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare phone: CreationOptional<string | null>;
  declare dateOfBirth: CreationOptional<Date | null>;
  declare gender: CreationOptional<string | null>;
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
}

export function initPerson(sequelize: Sequelize) {
  Person.init(
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
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
    },
    {
      sequelize,
      tableName: "people",
      timestamps: true,
    }
  );

  return Person;
}
