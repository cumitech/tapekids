"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "division", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await ensureColumn(queryInterface, "people", "subDivision", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "people", "subDivision");
    await dropColumnIfExists(queryInterface, "people", "division");
  },
};
