"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("people", "division", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
    await queryInterface.addColumn("people", "subDivision", {
      type: Sequelize.STRING(80),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("people", "subDivision");
    await queryInterface.removeColumn("people", "division");
  },
};
