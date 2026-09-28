"use strict";

const { ensureTable, dropTableIfExists, tableExists } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "app_settings", {
      key: { type: Sequelize.STRING(64), allowNull: false, primaryKey: true },
      value: { type: Sequelize.STRING(255), allowNull: false },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    const [existing] = await queryInterface.sequelize.query(
      "SELECT `key` AS settingKey FROM app_settings WHERE `key` = :key LIMIT 1",
      { replacements: { key: "invitation_links_open" } }
    );
    if (!existing.length) {
      const now = new Date();
      await queryInterface.bulkInsert("app_settings", [
        {
          key: "invitation_links_open",
          value: "true",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    if (await tableExists(queryInterface, "invitations")) {
      await queryInterface.sequelize.query(`
        UPDATE invitations
        SET expiresAt = DATE_ADD(NOW(), INTERVAL 30 DAY)
        WHERE status IN ('queued', 'sent')
          AND (expiresAt IS NULL OR expiresAt < DATE_ADD(NOW(), INTERVAL 30 DAY))
      `);
    }
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "app_settings");
  },
};
