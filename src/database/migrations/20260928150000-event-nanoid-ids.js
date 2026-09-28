"use strict";

const { tableExists } = require("../migration-guard");
const { RECORD_ID_LENGTH, recordId } = require("../seed-id");

async function replaceEventId(queryInterface, oldId, newId) {
  await queryInterface.sequelize.query(
    "UPDATE events SET id = :newId WHERE id = :oldId",
    { replacements: { oldId, newId } }
  );
  if (await tableExists(queryInterface, "content_translations")) {
    await queryInterface.sequelize.query(
      `UPDATE content_translations
       SET entityId = :newId
       WHERE entityType = 'event' AND entityId = :oldId`,
      { replacements: { oldId, newId } }
    );
  }
  if (await tableExists(queryInterface, "audit_logs")) {
    await queryInterface.sequelize.query(
      `UPDATE audit_logs
       SET entityId = :newId
       WHERE entity = 'events' AND entityId = :oldId`,
      { replacements: { oldId, newId } }
    );
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    if (!(await tableExists(queryInterface, "events"))) {
      return;
    }

    const [events] = await queryInterface.sequelize.query(
      `SELECT id FROM events
       WHERE CHAR_LENGTH(id) <> :len OR id LIKE 'sd%'`,
      { replacements: { len: RECORD_ID_LENGTH } }
    );

    if (!events.length) {
      return;
    }

    const used = new Set();
    const [all] = await queryInterface.sequelize.query("SELECT id FROM events");
    for (const row of all) {
      used.add(row.id);
    }

    for (const event of events) {
      let next = recordId();
      while (used.has(next)) {
        next = recordId();
      }
      used.delete(event.id);
      used.add(next);
      await replaceEventId(queryInterface, event.id, next);
    }
  },

  async down() {
    // Irreversible: original short event ids are not stored.
  },
};
