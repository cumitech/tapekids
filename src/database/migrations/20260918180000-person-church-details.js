"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "churchPastorName", {
      type: Sequelize.STRING(128),
      allowNull: true,
    });
    await ensureColumn(queryInterface, "people", "churchAddress", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "people", "churchAddress");
    await dropColumnIfExists(queryInterface, "people", "churchPastorName");
  },
};
