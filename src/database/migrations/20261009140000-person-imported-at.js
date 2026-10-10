"use strict";

const {
  ensureColumn,
  dropColumnIfExists,
  ensureIndex,
  dropIndexesOnColumns,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "people", "importedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await ensureIndex(queryInterface, "people", ["importedAt"], {
      name: "people_imported_at_idx",
    });

    // Backfill existing imported people with their creation date if yfId is present
    await queryInterface.sequelize.query(`
      UPDATE people
      SET importedAt = createdAt
      WHERE importedAt IS NULL AND yfId IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await dropIndexesOnColumns(queryInterface, "people", ["importedAt"]);
    await dropColumnIfExists(queryInterface, "people", "importedAt");
  },
};
