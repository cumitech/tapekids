"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("people", "gender", {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("people", "gender");
  },
};
