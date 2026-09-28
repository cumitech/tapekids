"use strict";

const { paymentTrackingId } = require("../seed-id");
const {
  columnExists,
  ensureColumn,
  ensureIndex,
  dropColumnIfExists,
  dropIndexesOnColumns,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await columnExists(queryInterface, "payments", "trackingId"))) {
      await ensureColumn(queryInterface, "payments", "trackingId", {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }

    if (!(await columnExists(queryInterface, "payments", "trackingId"))) {
      return;
    }

    const [missing] = await queryInterface.sequelize.query(
      "SELECT id FROM payments WHERE trackingId IS NULL OR trackingId = ''"
    );
    const [assigned] = await queryInterface.sequelize.query(
      "SELECT trackingId FROM payments WHERE trackingId IS NOT NULL AND trackingId <> ''"
    );

    const used = new Set(assigned.map((row) => row.trackingId));
    for (const row of missing) {
      let next = paymentTrackingId();
      while (used.has(next)) {
        next = paymentTrackingId();
      }
      used.add(next);
      await queryInterface.sequelize.query(
        "UPDATE payments SET trackingId = :next WHERE id = :id",
        { replacements: { next, id: row.id } }
      );
    }

    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY trackingId VARCHAR(20) NOT NULL"
    );

    await ensureIndex(queryInterface, "payments", ["trackingId"], {
      name: "payments_tracking_id",
      unique: true,
    });
  },

  async down(queryInterface) {
    await dropIndexesOnColumns(queryInterface, "payments", ["trackingId"], {
      uniqueOnly: true,
    });
    await dropColumnIfExists(queryInterface, "payments", "trackingId");
  },
};
