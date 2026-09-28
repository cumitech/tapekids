"use strict";

const { ensureTable, ensureIndex, dropTableIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "audit_logs", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      actorId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: { type: Sequelize.STRING(64), allowNull: false },
      entity: { type: Sequelize.STRING(64), allowNull: false },
      entityId: { type: Sequelize.STRING(64), allowNull: true },
      changes: { type: Sequelize.JSON, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await ensureIndex(queryInterface, "audit_logs", ["entity", "entityId"], {
      name: "audit_logs_entity_entity_id",
    });
    await ensureIndex(queryInterface, "audit_logs", ["createdAt"], {
      name: "audit_logs_created_at",
    });

    await ensureTable(queryInterface, "password_resets", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tokenHash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      usedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "password_resets");
    await dropTableIfExists(queryInterface, "audit_logs");
  },
};
