"use strict";

const {
  ensureColumn,
  dropColumnIfExists,
  changeColumnIfExists,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "password_resets", "purpose", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "reset-password",
    });

    await ensureColumn(queryInterface, "users", "sessionVersion", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await changeColumnIfExists(queryInterface, "users", "role", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "guest",
    });
  },

  async down(queryInterface, Sequelize) {
    await dropColumnIfExists(queryInterface, "password_resets", "purpose");
    await dropColumnIfExists(queryInterface, "users", "sessionVersion");
    await changeColumnIfExists(queryInterface, "users", "role", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "staff",
    });
  },
};
