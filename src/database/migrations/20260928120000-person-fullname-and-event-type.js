"use strict";

const {
  ensureColumn,
  dropColumnIfExists,
  changeColumnIfExists,
  columnExists,
  dropIndexesOnColumns,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "fullName", {
      type: Sequelize.STRING(160),
      allowNull: true,
    });

    if (await columnExists(queryInterface, "people", "firstName")) {
      await queryInterface.sequelize.query(`
        UPDATE people
        SET fullName = TRIM(CONCAT(COALESCE(firstName, ''), ' ', COALESCE(lastName, '')))
        WHERE fullName IS NULL OR fullName = ''
      `);
    }

    await changeColumnIfExists(queryInterface, "people", "fullName", {
      type: Sequelize.STRING(160),
      allowNull: false,
    });

    await dropColumnIfExists(queryInterface, "people", "firstName");
    await dropColumnIfExists(queryInterface, "people", "lastName");

    await ensureColumn(queryInterface, "people", "yfId", {
      type: Sequelize.STRING(32),
      allowNull: true,
      unique: true,
    });
    await ensureColumn(queryInterface, "people", "points", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await ensureColumn(queryInterface, "people", "ageYears", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await ensureColumn(queryInterface, "people", "isTrophy", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await ensureColumn(queryInterface, "people", "category", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    // Sibling rows in Young Foundations exports share a parent email.
    await changeColumnIfExists(queryInterface, "people", "email", {
      type: Sequelize.STRING(128),
      allowNull: true,
      unique: false,
    });
    await dropIndexesOnColumns(queryInterface, "people", ["email"], {
      uniqueOnly: true,
    });

    await ensureColumn(queryInterface, "events", "eventType", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "camp",
    });
  },

  async down(queryInterface, Sequelize) {
    await dropColumnIfExists(queryInterface, "events", "eventType");

    await ensureColumn(queryInterface, "people", "firstName", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await ensureColumn(queryInterface, "people", "lastName", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });

    if (await columnExists(queryInterface, "people", "fullName")) {
      await queryInterface.sequelize.query(`
        UPDATE people
        SET
          firstName = SUBSTRING_INDEX(fullName, ' ', 1),
          lastName = TRIM(SUBSTRING(fullName, LENGTH(SUBSTRING_INDEX(fullName, ' ', 1)) + 1))
        WHERE fullName IS NOT NULL
      `);
    }

    await changeColumnIfExists(queryInterface, "people", "firstName", {
      type: Sequelize.STRING(80),
      allowNull: false,
    });
    await changeColumnIfExists(queryInterface, "people", "lastName", {
      type: Sequelize.STRING(80),
      allowNull: false,
    });

    await dropColumnIfExists(queryInterface, "people", "fullName");
    await dropColumnIfExists(queryInterface, "people", "yfId");
    await dropColumnIfExists(queryInterface, "people", "points");
    await dropColumnIfExists(queryInterface, "people", "ageYears");
    await dropColumnIfExists(queryInterface, "people", "isTrophy");
    await dropColumnIfExists(queryInterface, "people", "category");

    await changeColumnIfExists(queryInterface, "people", "email", {
      type: Sequelize.STRING(128),
      allowNull: false,
      unique: true,
    });
  },
};
