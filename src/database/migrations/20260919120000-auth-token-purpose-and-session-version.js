"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("password_resets", "purpose", {
      type: Sequelize.STRING(32),
      allowNull: false,
      defaultValue: "reset-password",
    });

    await queryInterface.addColumn("users", "sessionVersion", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "guest",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("password_resets", "purpose");
    await queryInterface.removeColumn("users", "sessionVersion");
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "staff",
    });
  },
};
