"use strict";

const { ensureTable, dropTableIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "users", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      email: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      username: { type: Sequelize.STRING(50), allowNull: false },
      password: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "staff" },
      verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await ensureTable(queryInterface, "events", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      title: { type: Sequelize.STRING(128), allowNull: false },
      slug: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      venue: { type: Sequelize.STRING(128), allowNull: false },
      city: { type: Sequelize.STRING(80), allowNull: false },
      startsAt: { type: Sequelize.DATE, allowNull: false },
      endsAt: { type: Sequelize.DATE, allowNull: true },
      isPublished: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdById: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "events");
    await dropTableIfExists(queryInterface, "users");
  },
};
