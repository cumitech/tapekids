"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "country", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "people", "country");
  },
};
