"use strict";

const { ensureColumn, dropColumnIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "invitation_batches", "linksOpen", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await ensureColumn(queryInterface, "invitations", "linksOpen", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "invitation_batches", "linksOpen");
    await dropColumnIfExists(queryInterface, "invitations", "linksOpen");
  },
};
