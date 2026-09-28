"use strict";

const {
  ensureTable,
  ensureColumn,
  ensureIndex,
  dropTableIfExists,
  dropColumnIfExists,
} = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await ensureTable(queryInterface, "people", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      firstName: { type: Sequelize.STRING(80), allowNull: false },
      lastName: { type: Sequelize.STRING(80), allowNull: false },
      email: { type: Sequelize.STRING(128), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      dateOfBirth: { type: Sequelize.DATEONLY, allowNull: true },
      address: { type: Sequelize.STRING(255), allowNull: true },
      churchName: { type: Sequelize.STRING(128), allowNull: true },
      town: { type: Sequelize.STRING(80), allowNull: true },
      region: { type: Sequelize.STRING(80), allowNull: true },
      parentGuardianName: { type: Sequelize.STRING(128), allowNull: true },
      parentGuardianPhone: { type: Sequelize.STRING(20), allowNull: true },
      medicalNotes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await ensureColumn(queryInterface, "users", "personId", {
      type: Sequelize.STRING(20),
      allowNull: true,
      references: { model: "people", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await ensureColumn(queryInterface, "events", "requiresParticipantFee", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await ensureColumn(queryInterface, "events", "participantFeeAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await ensureColumn(queryInterface, "events", "currency", {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "XAF",
    });
    await ensureColumn(queryInterface, "events", "coordinatorFundAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await ensureColumn(queryInterface, "events", "sponsorFundAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await ensureTable(queryInterface, "emergency_contacts", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING(128), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      relation: { type: Sequelize.STRING(50), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await ensureTable(queryInterface, "event_memberships", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      eventId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "events", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      kind: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "camper" },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "invited" },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await ensureIndex(queryInterface, "event_memberships", ["eventId", "personId", "kind"], {
      unique: true,
      name: "event_memberships_event_person_kind",
    });

    await ensureTable(queryInterface, "mailing_lists", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING(128), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      audienceKind: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "mixed" },
      createdById: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await ensureTable(queryInterface, "mailing_list_members", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      mailingListId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "mailing_lists", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await ensureIndex(queryInterface, "mailing_list_members", ["mailingListId", "personId"], {
      unique: true,
      name: "mailing_list_members_list_person",
    });

    await ensureTable(queryInterface, "invitation_batches", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      eventId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "events", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      mailingListId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        references: { model: "mailing_lists", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      kind: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "camper" },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      sentById: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "draft" },
      sentAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });

    await ensureTable(queryInterface, "invitations", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      batchId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "invitation_batches", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      eventId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "events", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      kind: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "camper" },
      token: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      emailSnapshot: { type: Sequelize.STRING(128), allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "queued" },
      sentAt: { type: Sequelize.DATE, allowNull: true },
      acceptedAt: { type: Sequelize.DATE, allowNull: true },
      expiresAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
    await ensureIndex(queryInterface, "invitations", ["eventId", "personId", "kind"], {
      name: "invitations_event_person_kind",
    });

    await ensureTable(queryInterface, "payments", {
      id: { type: Sequelize.STRING(20), allowNull: false, primaryKey: true },
      eventId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "events", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      personId: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      kind: { type: Sequelize.STRING(32), allowNull: false, defaultValue: "participant_fee" },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: "XAF" },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: "pending" },
      providerRef: { type: Sequelize.STRING(128), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    });
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "payments");
    await dropTableIfExists(queryInterface, "invitations");
    await dropTableIfExists(queryInterface, "invitation_batches");
    await dropTableIfExists(queryInterface, "mailing_list_members");
    await dropTableIfExists(queryInterface, "mailing_lists");
    await dropTableIfExists(queryInterface, "event_memberships");
    await dropTableIfExists(queryInterface, "emergency_contacts");
    await dropColumnIfExists(queryInterface, "events", "sponsorFundAmount");
    await dropColumnIfExists(queryInterface, "events", "coordinatorFundAmount");
    await dropColumnIfExists(queryInterface, "events", "currency");
    await dropColumnIfExists(queryInterface, "events", "participantFeeAmount");
    await dropColumnIfExists(queryInterface, "events", "requiresParticipantFee");
    await dropColumnIfExists(queryInterface, "users", "personId");
    await dropTableIfExists(queryInterface, "people");
  },
};
