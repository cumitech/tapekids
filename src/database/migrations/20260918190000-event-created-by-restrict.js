"use strict";

const { constraintExists, dropConstraintIfExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    if (await constraintExists(queryInterface, "events", "events_createdById_users_fk")) {
      return;
    }

    const [rows] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME AS name
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'events'
         AND COLUMN_NAME = 'createdById'
         AND REFERENCED_TABLE_NAME = 'users'`
    );
    const name = rows[0]?.name;
    if (name) {
      await queryInterface.sequelize.query(
        `ALTER TABLE events DROP FOREIGN KEY \`${name}\``
      );
    }
    await queryInterface.addConstraint("events", {
      fields: ["createdById"],
      type: "foreign key",
      name: "events_createdById_users_fk",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await dropConstraintIfExists(queryInterface, "events", "events_createdById_users_fk");
    if (await constraintExists(queryInterface, "events", "events_ibfk_1")) {
      return;
    }
    await queryInterface.addConstraint("events", {
      fields: ["createdById"],
      type: "foreign key",
      name: "events_ibfk_1",
      references: { table: "users", field: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
