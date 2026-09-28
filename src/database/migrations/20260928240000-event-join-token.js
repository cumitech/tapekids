"use strict";

const {
  ensureColumn,
  ensureIndex,
  dropColumnIfExists,
  dropIndexesOnColumns,
} = require("../migration-guard");

/** Per-event share token. Null until an administrator generates a link. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "events", "joinToken", {
      type: Sequelize.STRING(48),
      allowNull: true,
    });
    await ensureIndex(queryInterface, "events", ["joinToken"], {
      name: "events_join_token",
      unique: true,
    });
  },

  async down(queryInterface) {
    await dropIndexesOnColumns(queryInterface, "events", ["joinToken"], {
      uniqueOnly: true,
    });
    await dropColumnIfExists(queryInterface, "events", "joinToken");
  },
};
