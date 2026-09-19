"use strict";

const { upsertSeedLogins } = require("../seed-accounts");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await upsertSeedLogins(queryInterface);
  },

  async down(queryInterface) { 
    await queryInterface.sequelize.query(
      "DELETE FROM users WHERE email IN (:emails)",
      {
        replacements: {
          emails: [
            "superadmin@seed.kidsevent.cm",
            "admin@seed.kidsevent.cm",
            "staff@seed.kidsevent.cm",
            "guest@seed.kidsevent.cm",
          ],
        },
      }
    );
  },
};
