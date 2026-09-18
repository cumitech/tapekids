"use strict";

const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");

const SEED_PASSWORD_FALLBACK = "SeedPass123!";

const SEED_LOGINS = {
  superAdmin: {
    id: "sduser0000",
    email: "superadmin@seed.kidsevent.cm",
    username: "seed.superadmin",
    role: "super-admin",
    personId: null,
  },
  admin: {
    id: "sduser0001",
    email: "admin@seed.kidsevent.cm",
    username: "seed.admin",
    role: "admin",
    personId: null,
  },
  staff: {
    id: "sduser0002",
    email: "staff@seed.kidsevent.cm",
    username: "seed.staff",
    role: "staff",
    personId: "sdperson01",
  },
  guest: {
    id: "sduser0003",
    email: "guest@seed.kidsevent.cm",
    username: "seed.guest",
    role: "guest",
    personId: "sdperson07",
  },
};

function seedPlainPassword() {
  return process.env.SEED_PASSWORD || SEED_PASSWORD_FALLBACK;
}

async function findUserByEmail(queryInterface, email) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE LOWER(email) = :userEmail LIMIT 1",
    {
      replacements: { userEmail: email.toLowerCase() },
      type: QueryTypes.SELECT,
    }
  );
  return rows[0] ?? null;
}

async function findUserById(queryInterface, userId) {
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE id = :userId LIMIT 1",
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
    }
  );
  return rows[0] ?? null;
}

async function personExists(queryInterface, personId) {
  if (!personId) {
    return false;
  }
  const rows = await queryInterface.sequelize.query(
    "SELECT id FROM people WHERE id = :personId LIMIT 1",
    { replacements: { personId }, type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function updateSeedUser(queryInterface, userId, account, password, now) {
  const personId = (await personExists(queryInterface, account.personId))
    ? account.personId
    : null;

  await queryInterface.sequelize.query(
    `UPDATE users
     SET password = :passwordHash,
         username = :username,
         email = :userEmail,
         role = :roleName,
         verified = 1,
         personId = :personId,
         updatedAt = :updatedAt
     WHERE id = :existingId`,
    {
      replacements: {
        passwordHash: password,
        username: account.username,
        userEmail: account.email.toLowerCase(),
        roleName: account.role,
        personId,
        updatedAt: now,
        existingId: userId,
      },
    }
  );
}

async function ensureSeedUser(queryInterface, account, password, now) {
  const byEmail = await findUserByEmail(queryInterface, account.email);
  const byId = await findUserById(queryInterface, account.id);

  if (byEmail && byEmail.id !== account.id && !byId) {
    await queryInterface.sequelize.query(
      "UPDATE users SET id = :canonicalId WHERE id = :existingId",
      {
        replacements: {
          canonicalId: account.id,
          existingId: byEmail.id,
        },
      }
    );
    await updateSeedUser(queryInterface, account.id, account, password, now);
    return account.id;
  }

  if (byEmail) {
    await updateSeedUser(queryInterface, byEmail.id, account, password, now);
    return byEmail.id;
  }

  if (byId) {
    await updateSeedUser(queryInterface, account.id, account, password, now);
    return account.id;
  }

  const personId = (await personExists(queryInterface, account.personId))
    ? account.personId
    : null;

  await queryInterface.bulkInsert("users", [
    {
      id: account.id,
      email: account.email.toLowerCase(),
      username: account.username,
      password,
      role: account.role,
      verified: true,
      personId,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  return account.id;
}

async function upsertSeedLogins(queryInterface) {
  const password = await bcrypt.hash(seedPlainPassword(), 10);
  const now = new Date();
  const resolved = {};

  for (const [key, account] of Object.entries(SEED_LOGINS)) {
    const id = await ensureSeedUser(queryInterface, account, password, now);
    resolved[key] = { ...account, id };
  }

  return resolved;
}

module.exports = {
  SEED_LOGINS,
  seedPlainPassword,
  upsertSeedLogins,
};
