"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("events", "summary", {
      type: Sequelize.STRING(280),
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE events
       SET summary = LEFT(TRIM(description), 280)
       WHERE summary IS NULL OR summary = ''`
    );

    await queryInterface.changeColumn("events", "summary", {
      type: Sequelize.STRING(280),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("events", "summary");
  },
};
