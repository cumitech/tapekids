"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("people", {
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

    await queryInterface.addColumn("users", "personId", {
      type: Sequelize.STRING(20),
      allowNull: true,
      references: { model: "people", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("events", "requiresParticipantFee", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("events", "participantFeeAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("events", "currency", {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "XAF",
    });
    await queryInterface.addColumn("events", "coordinatorFundAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn("events", "sponsorFundAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.createTable("emergency_contacts", {
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

    await queryInterface.createTable("event_memberships", {
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
    await queryInterface.addIndex("event_memberships", ["eventId", "personId", "kind"], {
      unique: true,
      name: "event_memberships_event_person_kind",
    });

    await queryInterface.createTable("mailing_lists", {
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

    await queryInterface.createTable("mailing_list_members", {
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
    await queryInterface.addIndex("mailing_list_members", ["mailingListId", "personId"], {
      unique: true,
      name: "mailing_list_members_list_person",
    });

    await queryInterface.createTable("invitation_batches", {
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

    await queryInterface.createTable("invitations", {
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
    await queryInterface.addIndex("invitations", ["eventId", "personId", "kind"], {
      name: "invitations_event_person_kind",
    });

    await queryInterface.createTable("payments", {
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
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("invitations");
    await queryInterface.dropTable("invitation_batches");
    await queryInterface.dropTable("mailing_list_members");
    await queryInterface.dropTable("mailing_lists");
    await queryInterface.dropTable("event_memberships");
    await queryInterface.dropTable("emergency_contacts");
    await queryInterface.removeColumn("events", "sponsorFundAmount");
    await queryInterface.removeColumn("events", "coordinatorFundAmount");
    await queryInterface.removeColumn("events", "currency");
    await queryInterface.removeColumn("events", "participantFeeAmount");
    await queryInterface.removeColumn("events", "requiresParticipantFee");
    await queryInterface.removeColumn("users", "personId");
    await queryInterface.dropTable("people");
  },
};
