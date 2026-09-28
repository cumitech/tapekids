"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "waiting_list", "details", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "waiting_list", "details");
  },
};
