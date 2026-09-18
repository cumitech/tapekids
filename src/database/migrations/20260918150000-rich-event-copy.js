"use strict";

const { EVENT_COPY } = require("../seed-event-copy");

async function upsertTranslation(
  queryInterface,
  now,
  entityId,
  locale,
  field,
  value
) {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM content_translations
     WHERE entityType = 'event' AND entityId = :entityId AND locale = :locale AND field = :field
     LIMIT 1`,
    { replacements: { entityId, locale, field } }
  );

  if (rows.length > 0) {
    await queryInterface.sequelize.query(
      `UPDATE content_translations
       SET value = :value, updatedAt = :updatedAt
       WHERE id = :id`,
      { replacements: { value, updatedAt: now, id: rows[0].id } }
    );
    return;
  }

  const { customAlphabet } = require("nanoid");
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    20
  )();
  await queryInterface.bulkInsert("content_translations", [
    {
      id,
      entityType: "event",
      entityId,
      locale,
      field,
      value,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const [eventId, copy] of Object.entries(EVENT_COPY)) {
      await queryInterface.sequelize.query(
        `UPDATE events
         SET title = :title,
             summary = :summary,
             description = :description,
             venue = :venue,
             imageUrl = :imageUrl,
             updatedAt = :updatedAt
         WHERE id = :eventId`,
        {
          replacements: {
            title: copy.en.title,
            summary: copy.en.summary,
            description: copy.en.description,
            venue: copy.en.venue,
            imageUrl: copy.imageUrl,
            updatedAt: now,
            eventId,
          },
        }
      );

      for (const locale of ["en", "fr"]) {
        const fields = copy[locale];
        for (const field of ["title", "summary", "description", "venue"]) {
          await upsertTranslation(
            queryInterface,
            now,
            eventId,
            locale,
            field,
            fields[field]
          );
        }
      }
    }
  },

  async down() {
    // Content-only update; previous copy is not restored.
  },
};
