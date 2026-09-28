"use strict";

const { customAlphabet } = require("nanoid");

const { ensureTable, ensureIndex, dropTableIfExists } = require("../migration-guard");

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  20
);

async function backfill(queryInterface, entityType, table, columns) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id, ${columns.join(", ")} FROM ${table}`
  );

  if (!rows.length) {
    return;
  }

  const now = new Date();
  const records = [];

  for (const row of rows) {
    for (const locale of ["en", "fr"]) {
      for (const field of columns) {
        const value = row[field];
        if (value == null || String(value).trim() === "") {
          continue;
        }
        records.push({
          id: nanoid(),
          entityType,
          entityId: row.id,
          locale,
          field,
          value: String(value),
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  if (!records.length) {
    return;
  }

  const [existing] = await queryInterface.sequelize.query(
    `SELECT entityId, locale, field
     FROM content_translations
     WHERE entityType = :entityType`,
    { replacements: { entityType } }
  );
  const seen = new Set(
    existing.map((row) => `${row.entityId}\0${row.locale}\0${row.field}`)
  );
  const fresh = records.filter(
    (row) => !seen.has(`${row.entityId}\0${row.locale}\0${row.field}`)
  );

  if (fresh.length) {
    await queryInterface.bulkInsert("content_translations", fresh);
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "content_translations", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      entityType: { type: Sequelize.STRING(32), allowNull: false },
      entityId: { type: Sequelize.STRING(20), allowNull: false },
      locale: { type: Sequelize.STRING(8), allowNull: false },
      field: { type: Sequelize.STRING(64), allowNull: false },
      value: { type: Sequelize.TEXT, allowNull: false },
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

    await ensureIndex(queryInterface, "content_translations", {
      unique: true,
      name: "content_translations_entity_locale_field",
      fields: ["entityType", "entityId", "locale", "field"],
    });
    await ensureIndex(queryInterface, "content_translations", {
      name: "content_translations_entity",
      fields: ["entityType", "entityId"],
    });

    await backfill(queryInterface, "event", "events", [
      "title",
      "summary",
      "description",
      "venue",
    ]);
    await backfill(queryInterface, "mailing_list", "mailing_lists", [
      "name",
      "description",
    ]);
    await backfill(queryInterface, "invitation_batch", "invitation_batches", [
      "subject",
      "body",
    ]);
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "content_translations");
  },
};
