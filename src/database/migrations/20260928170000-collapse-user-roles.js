"use strict";

const { tableExists } = require("../migration-guard");

/** Existing staff and super-admin accounts become admins. */
module.exports = {
  async up(queryInterface) {
    if (!(await tableExists(queryInterface, "users"))) {
      return;
    }
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'admin' WHERE role IN ('staff', 'super-admin')"
    );
  },

  async down() {
    return Promise.resolve();
  },
};
