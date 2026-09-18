"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("people", "country", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("people", "country");
  },
};
