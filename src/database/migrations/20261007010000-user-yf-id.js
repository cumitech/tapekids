"use strict";

const {
  changeColumnIfExists,
  columnExists,
  dropColumnIfExists,
  dropIndexesOnColumns,
  ensureColumn,
  ensureIndex,
} = require("../migration-guard");

const GUEST_EMAIL_DOMAIN = "@guest.kids-event.cm";

function normalizeYfId(value) {
  return String(value ?? "")
    .trim()
    .replace(/[\s-]+/g, "");
}

/**
 * Staff still sign in by email, so users.email stays unique.
 * A guest account gets its own address (yf.{yfId}@guest.kids-event.cm)
 * and the shared family address stays on the person.
 */
async function backfillUserYfIds(queryInterface) {
  if (!(await columnExists(queryInterface, "users", "yfId"))) {
    return;
  }
  if (!(await columnExists(queryInterface, "people", "yfId"))) {
    return;
  }
  await queryInterface.sequelize.query(`
    UPDATE users AS account
    INNER JOIN people AS person ON person.id = account.personId
    LEFT JOIN (
      SELECT id, yfId FROM users
    ) AS taken ON taken.yfId = person.yfId AND taken.id <> account.id
    SET account.yfId = person.yfId
    WHERE (account.yfId IS NULL OR account.yfId = '')
      AND person.yfId IS NOT NULL
      AND person.yfId <> ''
      AND taken.id IS NULL
  `);
}

async function releaseSharedGuestEmails(queryInterface) {
  if (!(await columnExists(queryInterface, "users", "yfId"))) {
    return;
  }
  await queryInterface.sequelize.query(
    `
    UPDATE users AS account
    INNER JOIN people AS person ON person.id = account.personId
    LEFT JOIN (
      SELECT id, email FROM users
    ) AS taken
      ON taken.email = CONCAT('yf.', IF(account.yfId IS NOT NULL AND account.yfId <> '', account.yfId, person.id), :domain)
     AND taken.id <> account.id
    SET account.email = CONCAT('yf.', IF(account.yfId IS NOT NULL AND account.yfId <> '', account.yfId, person.id), :domain)
    WHERE account.role = 'guest'
      AND person.email IS NOT NULL
      AND person.email <> ''
      AND LOWER(account.email) = LOWER(person.email)
      AND taken.id IS NULL
  `,
    { replacements: { domain: GUEST_EMAIL_DOMAIN } }
  );
}

async function backfillWaitingListYfIds(queryInterface) {
  if (!(await columnExists(queryInterface, "waiting_list", "yfId"))) {
    return;
  }
  if (!(await columnExists(queryInterface, "waiting_list", "details"))) {
    return;
  }
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id, details
     FROM waiting_list
     WHERE yfId IS NULL OR yfId = ''
     ORDER BY createdAt ASC, id ASC`
  );
  const [claimed] = await queryInterface.sequelize.query(
    `SELECT yfId FROM waiting_list WHERE yfId IS NOT NULL AND yfId <> ''`
  );
  const seen = new Set(claimed.map((row) => row.yfId));

  for (const row of rows) {
    let details = row.details;
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch {
        details = null;
      }
    }
    const yfId = normalizeYfId(details && typeof details === "object" ? details.yfId : "");
    if (!yfId || yfId.length > 32 || seen.has(yfId)) {
      continue;
    }
    seen.add(yfId);
    await queryInterface.sequelize.query(
      `UPDATE waiting_list
       SET yfId = :yfId
       WHERE id = :id AND (yfId IS NULL OR yfId = '')`,
      { replacements: { yfId, id: row.id } }
    );
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureColumn(queryInterface, "users", "yfId", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await ensureIndex(queryInterface, "users", ["yfId"], {
      name: "users_yf_id",
      unique: true,
    });
    await backfillUserYfIds(queryInterface);
    await releaseSharedGuestEmails(queryInterface);

    await changeColumnIfExists(queryInterface, "waiting_list", "email", {
      type: Sequelize.STRING(128),
      allowNull: false,
      unique: false,
    });
    await dropIndexesOnColumns(queryInterface, "waiting_list", ["email"], {
      uniqueOnly: true,
    });
    await ensureColumn(queryInterface, "waiting_list", "yfId", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });
    await backfillWaitingListYfIds(queryInterface);
    await ensureIndex(queryInterface, "waiting_list", ["yfId"], {
      name: "waiting_list_yf_id",
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await dropIndexesOnColumns(queryInterface, "waiting_list", ["yfId"], {
      uniqueOnly: true,
    });
    await dropColumnIfExists(queryInterface, "waiting_list", "yfId");

    const [duplicates] = await queryInterface.sequelize.query(
      `SELECT email
       FROM waiting_list
       GROUP BY email
       HAVING COUNT(*) > 1
       LIMIT 1`
    );
    if (duplicates.length === 0) {
      await ensureIndex(queryInterface, "waiting_list", ["email"], {
        name: "waiting_list_email",
        unique: true,
      });
      await changeColumnIfExists(queryInterface, "waiting_list", "email", {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      });
    }

    await dropIndexesOnColumns(queryInterface, "users", ["yfId"], {
      uniqueOnly: true,
    });
    await dropColumnIfExists(queryInterface, "users", "yfId");
  },
};
