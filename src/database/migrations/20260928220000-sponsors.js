"use strict";

const { ensureTable, dropTableIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "sponsors", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      eventId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "events", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      anonymous: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      paymentPhone: { type: Sequelize.STRING(20), allowNull: false },
      paymentId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: { model: "payments", key: "id" },
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
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "sponsors");
  },
};
