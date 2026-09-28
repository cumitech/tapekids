"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "gender", {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "people", "gender");
  },
};
