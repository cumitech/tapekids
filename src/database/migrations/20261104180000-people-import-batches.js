"use strict";

const {
  ensureIndex,
  ensureTable,
  dropTableIfExists,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "people_import_batches", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      category: { type: Sequelize.STRING(32), allowNull: false },
      importedAt: { type: Sequelize.DATE, allowNull: false },
      fileName: { type: Sequelize.STRING(255), allowNull: false },
      created: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      updated: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      unchanged: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      skipped: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      mailingListId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: { model: "mailing_lists", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
    await ensureIndex(
      queryInterface,
      "people_import_batches",
      ["category", "importedAt"],
      { name: "people_import_batches_category_date" }
    );
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "people_import_batches");
  },
};
