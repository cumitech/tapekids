"use strict";

const bcrypt = require("bcryptjs");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  20
);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const username = process.env.ADMIN_USERNAME || "admin";

    if (!email || !password) {
      console.warn("Skipping admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD");
      return;
    }

    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { replacements: { email } }
    );

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing.length > 0) {
      await queryInterface.sequelize.query(
        "UPDATE users SET password = :password, username = :username, verified = 1, updatedAt = :updatedAt WHERE email = :email",
        {
          replacements: {
            password: passwordHash,
            username,
            email,
            updatedAt: now,
          },
        }
      );
      return;
    }

    await queryInterface.bulkInsert("users", [
      {
        id: nanoid(),
        email,
        username,
        password: passwordHash,
        role: "admin",
        verified: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (!email) {
      return;
    }
    await queryInterface.bulkDelete("users", { email });
  },
};
