"use strict";

const { ensureTable, ensureIndex, dropTableIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "waiting_list", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      fullName: { type: Sequelize.STRING(160), allowNull: false },
      email: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      status: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: "pending",
      },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: { model: "people", key: "id" },
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

    await ensureIndex(queryInterface, "waiting_list", ["status"], {
      name: "waiting_list_status",
    });
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "waiting_list");
  },
};
