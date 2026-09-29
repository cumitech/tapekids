"use strict";

const { columnExists } = require("../migration-guard");

/**
 * Longer forms first so "coordinators" is not left half-replaced.
 * Each column is rewritten in one statement: protect machine tokens, swap
 * wording, then restore the tokens. A second run finds nothing to change.
 */
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

function replaceCall(expression, from, to) {
  return `REPLACE(${expression}, ${from}, ${to})`;
}

function rewritten(escape, column) {
  let expression = `\`${column}\``;
  for (const [from, to] of PROTECTED) {
    expression = replaceCall(expression, escape(from), escape(to));
  }
  for (const [from, to] of WORDS) {
    expression = replaceCall(expression, escape(from), escape(to));
  }
  for (const [from, to] of PROTECTED) {
    expression = replaceCall(expression, escape(to), escape(from));
  }
  return expression;
}

/** True only when visible wording would change. Machine tokens are ignored. */
function stillHasOldWording(escape, column) {
  let stripped = `\`${column}\``;
  for (const [from] of PROTECTED) {
    stripped = replaceCall(stripped, escape(from), escape(""));
  }
  // REPLACE is case-sensitive. LOCATE follows the column collation, so the
  // search string is binary and only rows REPLACE will change are selected.
  return WORDS.map(
    ([from]) =>
      `LOCATE(CAST(${escape(from)} AS BINARY(${Buffer.byteLength(from)})), ${stripped}) > 0`
  ).join(" OR ");
}

async function replaceInColumn(queryInterface, table, column) {
  if (!(await columnExists(queryInterface, table, column))) {
    return;
  }
  const escape = (value) => queryInterface.sequelize.escape(value);
  await queryInterface.sequelize.query(
    `UPDATE \`${table}\`
     SET \`${column}\` = ${rewritten(escape, column)}
     WHERE \`${column}\` IS NOT NULL
       AND (${stillHasOldWording(escape, column)})`
  );
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    if (await columnExists(queryInterface, "mailing_lists", "audienceKind")) {
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
