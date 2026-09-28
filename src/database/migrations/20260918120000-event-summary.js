"use strict";

const { ensureColumn, changeColumnIfExists, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "events", "summary", {
      type: Sequelize.STRING(280),
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE events
       SET summary = LEFT(TRIM(description), 280)
       WHERE summary IS NULL OR summary = ''`
    );

    await changeColumnIfExists(queryInterface, "events", "summary", {
      type: Sequelize.STRING(280),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "events", "summary");
  },
};
