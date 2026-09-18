"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("people", "churchPastorName", {
      type: Sequelize.STRING(128),
      allowNull: true,
    });
    await queryInterface.addColumn("people", "churchAddress", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("people", "churchAddress");
    await queryInterface.removeColumn("people", "churchPastorName");
  },
};
