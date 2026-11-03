"use strict";

const { columnExists } = require("../migration-guard");

const CATEGORY_TYPE = "enum('trophy_participant','trophy_camper')";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await columnExists(queryInterface, "people", "category"))) {
      return;
    }

    const [columns] = await queryInterface.sequelize.query(
      `SELECT COLUMN_TYPE AS columnType,
              IS_NULLABLE AS isNullable,
              COLUMN_DEFAULT AS columnDefault
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'people'
         AND COLUMN_NAME = 'category'
       LIMIT 1`
    );
    const current = columns[0];
    if (!current) {
      return;
    }

    const currentType = String(current.columnType ?? "").toLowerCase();
    if (
      currentType === CATEGORY_TYPE &&
      current.isNullable === "NO" &&
      current.columnDefault === "trophy_participant"
    ) {
      return;
    }

    await queryInterface.sequelize.query(
      "UPDATE `people` SET `category` = 'trophy_participant'"
    );
    await queryInterface.changeColumn("people", "category", {
      type: Sequelize.ENUM("trophy_participant", "trophy_camper"),
      allowNull: false,
      defaultValue: "trophy_participant",
    });
  },

  async down(queryInterface, Sequelize) {
    if (!(await columnExists(queryInterface, "people", "category"))) {
      return;
    }

    await queryInterface.changeColumn("people", "category", {
      type: Sequelize.STRING(32),
      allowNull: true,
      defaultValue: null,
    });
  },
};
