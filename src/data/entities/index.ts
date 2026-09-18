import { sequelize } from "@/database/db-sequelize.config";

import { AuditLog, initAuditLog } from "./audit-log";
import {
  ContentTranslation,
  initContentTranslation,
} from "./content-translation";
import { EmergencyContact, initEmergencyContact } from "./emergency-contact";
import { Event, initEvent } from "./event";
import { EventMembership, initEventMembership } from "./event-membership";
import { initInvitation, Invitation } from "./invitation";
import { initInvitationBatch, InvitationBatch } from "./invitation-batch";
import { initMailingList, MailingList } from "./mailing-list";
import { initMailingListMember, MailingListMember } from "./mailing-list-member";
import { initPasswordReset, PasswordReset } from "./password-reset";
import { initPayment, Payment } from "./payment";
import { initPerson, Person } from "./person";
import { initUser, User } from "./user";

let initialized = false;

export function initEntities() {
  if (initialized) {
    return;
  }

  initPerson(sequelize);
  initUser(sequelize);
  initEvent(sequelize);
  initContentTranslation(sequelize);
  initEmergencyContact(sequelize);
  initEventMembership(sequelize);
  initMailingList(sequelize);
  initMailingListMember(sequelize);
  initInvitationBatch(sequelize);
  initInvitation(sequelize);
  initPayment(sequelize);
  initAuditLog(sequelize);
  initPasswordReset(sequelize);

  Person.hasOne(User, {
    foreignKey: "personId",
    as: "user",
  });
  User.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  User.hasMany(Event, {
    foreignKey: "createdById",
    as: "events",
    onDelete: "RESTRICT",
  });
  Event.belongsTo(User, {
    foreignKey: "createdById",
    as: "createdBy",
  });

  Person.hasMany(EmergencyContact, {
    foreignKey: "personId",
    as: "emergencyContacts",
    onDelete: "CASCADE",
  });
  EmergencyContact.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  Event.hasMany(EventMembership, {
    foreignKey: "eventId",
    as: "memberships",
    onDelete: "CASCADE",
  });
  EventMembership.belongsTo(Event, {
    foreignKey: "eventId",
    as: "event",
  });
  Person.hasMany(EventMembership, {
    foreignKey: "personId",
    as: "memberships",
    onDelete: "CASCADE",
  });
  EventMembership.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  User.hasMany(MailingList, {
    foreignKey: "createdById",
    as: "mailingLists",
    onDelete: "CASCADE",
  });
  MailingList.belongsTo(User, {
    foreignKey: "createdById",
    as: "createdBy",
  });

  MailingList.hasMany(MailingListMember, {
    foreignKey: "mailingListId",
    as: "members",
    onDelete: "CASCADE",
  });
  MailingListMember.belongsTo(MailingList, {
    foreignKey: "mailingListId",
    as: "mailingList",
  });
  Person.hasMany(MailingListMember, {
    foreignKey: "personId",
    as: "mailingListMemberships",
    onDelete: "CASCADE",
  });
  MailingListMember.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  Event.hasMany(InvitationBatch, {
    foreignKey: "eventId",
    as: "invitationBatches",
    onDelete: "CASCADE",
  });
  InvitationBatch.belongsTo(Event, {
    foreignKey: "eventId",
    as: "event",
  });
  MailingList.hasMany(InvitationBatch, {
    foreignKey: "mailingListId",
    as: "invitationBatches",
    onDelete: "SET NULL",
  });
  InvitationBatch.belongsTo(MailingList, {
    foreignKey: "mailingListId",
    as: "mailingList",
  });
  User.hasMany(InvitationBatch, {
    foreignKey: "sentById",
    as: "invitationBatches",
    onDelete: "CASCADE",
  });
  InvitationBatch.belongsTo(User, {
    foreignKey: "sentById",
    as: "sentBy",
  });

  InvitationBatch.hasMany(Invitation, {
    foreignKey: "batchId",
    as: "invitations",
    onDelete: "CASCADE",
  });
  Invitation.belongsTo(InvitationBatch, {
    foreignKey: "batchId",
    as: "batch",
  });
  Event.hasMany(Invitation, {
    foreignKey: "eventId",
    as: "invitations",
    onDelete: "CASCADE",
  });
  Invitation.belongsTo(Event, {
    foreignKey: "eventId",
    as: "event",
  });
  Person.hasMany(Invitation, {
    foreignKey: "personId",
    as: "invitations",
    onDelete: "CASCADE",
  });
  Invitation.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  Event.hasMany(Payment, {
    foreignKey: "eventId",
    as: "payments",
    onDelete: "CASCADE",
  });
  Payment.belongsTo(Event, {
    foreignKey: "eventId",
    as: "event",
  });
  Person.hasMany(Payment, {
    foreignKey: "personId",
    as: "payments",
    onDelete: "CASCADE",
  });
  Payment.belongsTo(Person, {
    foreignKey: "personId",
    as: "person",
  });

  User.hasMany(AuditLog, {
    foreignKey: "actorId",
    as: "auditLogs",
    onDelete: "SET NULL",
  });
  AuditLog.belongsTo(User, {
    foreignKey: "actorId",
    as: "actor",
  });

  User.hasMany(PasswordReset, {
    foreignKey: "userId",
    as: "passwordResets",
    onDelete: "CASCADE",
  });
  PasswordReset.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  initialized = true;
}

export {
  AuditLog,
  ContentTranslation,
  EmergencyContact,
  Event,
  EventMembership,
  Invitation,
  InvitationBatch,
  MailingList,
  MailingListMember,
  PasswordReset,
  Payment,
  Person,
  User,
};
