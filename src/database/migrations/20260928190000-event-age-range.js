"use strict";

const { ensureColumn, dropColumnIfExists, columnExists } = require("../migration-guard");

/** Optional camper age bounds, and refresh stored ages from date of birth. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "events", "minAge", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await ensureColumn(queryInterface, "events", "maxAge", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    if (await columnExists(queryInterface, "people", "ageYears")) {
      await queryInterface.sequelize.query(`
        UPDATE people
        SET ageYears = CASE
          WHEN dateOfBirth IS NULL THEN NULL
          ELSE YEAR(CURDATE()) - YEAR(dateOfBirth)
            - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(dateOfBirth, '%m%d'))
        END
      `);
    }
  },

  async down(queryInterface) {
    await dropColumnIfExists(queryInterface, "events", "maxAge");
    await dropColumnIfExists(queryInterface, "events", "minAge");
  },
};
