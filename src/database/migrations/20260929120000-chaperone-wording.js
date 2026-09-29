"use strict";

const { tableExists, columnExists } = require("../migration-guard");

/** Longer forms first so "coordinators" is not left half-replaced. */
const WORDS = [
  ["Coordinators", "Chaperones"],
  ["coordinators", "chaperones"],
  ["Coordinator", "Chaperone"],
  ["coordinator", "chaperone"],
  ["Coordinateurs", "Encadreurs"],
  ["coordinateurs", "encadreurs"],
  ["Coordinateur", "Encadreur"],
  ["coordinateur", "encadreur"],
];

const PROTECTED = [
  ["coordinatorFundAmount", "___FUND_AMOUNT___"],
  ["coordinator_fund", "___FUND_KIND___"],
];

async function replaceInColumn(queryInterface, table, column) {
  if (!(await columnExists(queryInterface, table, column))) {
    return;
  }
  for (const [from, to] of PROTECTED) {
    await queryInterface.sequelize.query(
      `UPDATE \`${table}\` SET \`${column}\` = REPLACE(\`${column}\`, ?, ?) WHERE \`${column}\` LIKE ?`,
      { replacements: [from, to, `%${from}%`] }
    );
  }
  for (const [from, to] of WORDS) {
    await queryInterface.sequelize.query(
      `UPDATE \`${table}\` SET \`${column}\` = REPLACE(\`${column}\`, ?, ?) WHERE \`${column}\` LIKE ?`,
      { replacements: [from, to, `%${from}%`] }
    );
  }
  for (const [from, to] of PROTECTED) {
    await queryInterface.sequelize.query(
      `UPDATE \`${table}\` SET \`${column}\` = REPLACE(\`${column}\`, ?, ?) WHERE \`${column}\` LIKE ?`,
      { replacements: [to, from, `%${to}%`] }
    );
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    if (await tableExists(queryInterface, "mailing_lists")) {
      await queryInterface.sequelize.query(
        "UPDATE mailing_lists SET audienceKind = 'chaperone' WHERE audienceKind = 'coordinator'"
      );
      await queryInterface.sequelize.query(
        "UPDATE mailing_lists SET audienceKind = 'trophy_camper' WHERE audienceKind = 'camper'"
      );
    }

    const columns = {
      events: ["title", "summary", "description", "venue"],
      content_translations: ["value"],
      mailing_lists: ["name", "description"],
      invitation_batches: ["subject", "body"],
    };

    for (const [table, fields] of Object.entries(columns)) {
      for (const field of fields) {
        await replaceInColumn(queryInterface, table, field);
      }
    }
  },

  async down() {
    // Wording and audience values are the current names. Reversing them would
    // rename lists that were created as chaperone lists.
  },
};
