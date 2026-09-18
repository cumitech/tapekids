"use strict";

const { customAlphabet } = require("nanoid");
const {
  SEED_LOGINS,
  upsertSeedLogins,
} = require("../seed-accounts");
const { EVENT_COPY } = require("../seed-event-copy");

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  48
);
const translationId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  20
);

function translationRows(now, entityType, entityId, byLocale) {
  const rows = [];
  for (const [locale, fields] of Object.entries(byLocale)) {
    for (const [field, value] of Object.entries(fields)) {
      if (!value) {
        continue;
      }
      rows.push(
        stamp(now, {
          id: translationId(),
          entityType,
          entityId,
          locale,
          field,
          value,
        })
      );
    }
  }
  return rows;
}

async function clearSeed(queryInterface) {
  const statements = [
    "SET FOREIGN_KEY_CHECKS = 0",
    "DELETE FROM payments WHERE id LIKE 'sd%'",
    "DELETE FROM content_translations WHERE entityId LIKE 'sd%'",
    "DELETE FROM invitations WHERE id LIKE 'sd%'",
    "DELETE FROM invitation_batches WHERE id LIKE 'sd%'",
    "DELETE FROM mailing_list_members WHERE id LIKE 'sd%'",
    "DELETE FROM mailing_lists WHERE id LIKE 'sd%'",
    "DELETE FROM event_memberships WHERE id LIKE 'sd%'",
    "DELETE FROM events WHERE id LIKE 'sd%'",
    "DELETE FROM audit_logs WHERE id LIKE 'sd%'",
    "DELETE FROM users WHERE id LIKE 'sd%'",
    "DELETE FROM users WHERE email IN ('superadmin@seed.kidsevent.cm','admin@seed.kidsevent.cm','staff@seed.kidsevent.cm','guest@seed.kidsevent.cm')",
    "DELETE FROM emergency_contacts WHERE id LIKE 'sd%'",
    "DELETE FROM people WHERE id LIKE 'sd%'",
    "SET FOREIGN_KEY_CHECKS = 1",
  ];

  for (const sql of statements) {
    await queryInterface.sequelize.query(sql);
  }
}

function stamp(now, extra) {
  return { createdAt: now, updatedAt: now, ...extra };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await clearSeed(queryInterface);

    const now = new Date();
    const sentAt = new Date("2026-09-01T10:00:00.000Z");
    const acceptedAt = new Date("2026-09-08T14:20:00.000Z");

    const people = [
      stamp(now, {
        id: "sdperson01",
        firstName: "Marie",
        lastName: "Ngu",
        email: "marie.ngu@seed.kidsevent.cm",
        phone: "677201101",
        dateOfBirth: "1988-04-12",
        address: "Rue 1.234, Nlongkak",
        churchName: "Presbyterian Church Nlongkak",
        town: "Yaoundé",
        region: "Centre",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson02",
        firstName: "Paul",
        lastName: "Tchinda",
        email: "paul.tchinda@seed.kidsevent.cm",
        phone: "699334455",
        dateOfBirth: "1985-11-03",
        address: "Bonapriso, near St Peter",
        churchName: "EEC Bonapriso",
        town: "Douala",
        region: "Littoral",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson03",
        firstName: "Esther",
        lastName: "Fon",
        email: "esther.fon@seed.kidsevent.cm",
        phone: "675889900",
        dateOfBirth: "1992-07-19",
        address: "Nkwen, Station Road",
        churchName: "CBC Nkwen",
        town: "Bamenda",
        region: "Northwest",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson04",
        firstName: "Jean-Pierre",
        lastName: "Mbarga",
        email: "jp.mbarga@seed.kidsevent.cm",
        phone: "670112244",
        dateOfBirth: "1990-01-28",
        address: "Mvog-Ada",
        churchName: "Cathédrale Notre-Dame",
        town: "Yaoundé",
        region: "Centre",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson05",
        firstName: "Grace",
        lastName: "Atangana",
        email: "grace.atangana@seed.kidsevent.cm",
        phone: "655778899",
        dateOfBirth: "1978-09-09",
        address: "Bastos",
        churchName: "Presbyterian Church Nlongkak",
        town: "Yaoundé",
        region: "Centre",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson06",
        firstName: "Samuel",
        lastName: "Ewane",
        email: "samuel.ewane@seed.kidsevent.cm",
        phone: "694556677",
        dateOfBirth: "1975-02-14",
        address: "Akwa Nord",
        churchName: "EEC Bonapriso",
        town: "Douala",
        region: "Littoral",
        parentGuardianName: null,
        parentGuardianPhone: null,
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson07",
        firstName: "Amina",
        lastName: "Ngo",
        email: "amina.ngo@seed.kidsevent.cm",
        phone: "671223344",
        dateOfBirth: "2014-03-22",
        address: "Melen 4",
        churchName: "Presbyterian Church Nlongkak",
        town: "Yaoundé",
        region: "Centre",
        parentGuardianName: "Chantal Ngo",
        parentGuardianPhone: "677889900",
        medicalNotes: "Mild peanut allergy. Carry antihistamine.",
      }),
      stamp(now, {
        id: "sdperson08",
        firstName: "Daniel",
        lastName: "Fokou",
        email: "daniel.fokou@seed.kidsevent.cm",
        phone: "673445566",
        dateOfBirth: "2013-08-05",
        address: "Bonamoussadi",
        churchName: "EEC Bonapriso",
        town: "Douala",
        region: "Littoral",
        parentGuardianName: "Henri Fokou",
        parentGuardianPhone: "699112233",
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson09",
        firstName: "Blessing",
        lastName: "Nyong",
        email: "blessing.nyong@seed.kidsevent.cm",
        phone: "676778899",
        dateOfBirth: "2015-12-11",
        address: "Molyko",
        churchName: "Presbyterian Church Buea Town",
        town: "Buea",
        region: "Southwest",
        parentGuardianName: "Agnes Nyong",
        parentGuardianPhone: "677445566",
        medicalNotes: "Uses an inhaler for asthma.",
      }),
      stamp(now, {
        id: "sdperson10",
        firstName: "Joel",
        lastName: "Kameni",
        email: "joel.kameni@seed.kidsevent.cm",
        phone: "680334455",
        dateOfBirth: "2012-06-30",
        address: "Mankon",
        churchName: "CBC Nkwen",
        town: "Bamenda",
        region: "Northwest",
        parentGuardianName: "Peter Kameni",
        parentGuardianPhone: "675001122",
        medicalNotes: null,
      }),
      stamp(now, {
        id: "sdperson11",
        firstName: "Sarah",
        lastName: "Mbe",
        email: "sarah.mbe@seed.kidsevent.cm",
        phone: "681223355",
        dateOfBirth: "2016-01-18",
        address: "Bafoussam Centre",
        churchName: "EEC Bafoussam",
        town: "Bafoussam",
        region: "West",
        parentGuardianName: "Ruth Mbe",
        parentGuardianPhone: "677667788",
        medicalNotes: "Vegetarian meals only.",
      }),
      stamp(now, {
        id: "sdperson12",
        firstName: "Emmanuel",
        lastName: "Tabe",
        email: "emmanuel.tabe@seed.kidsevent.cm",
        phone: "682990011",
        dateOfBirth: "2011-10-02",
        address: "Limbe I",
        churchName: "Presbyterian Church Down Beach",
        town: "Limbe",
        region: "Southwest",
        parentGuardianName: "John Tabe",
        parentGuardianPhone: "699223344",
        medicalNotes: null,
      }),
    ];

    await queryInterface.bulkInsert("people", people);

    await queryInterface.bulkInsert("emergency_contacts", [
      stamp(now, {
        id: "sdcontact01",
        personId: "sdperson07",
        name: "Chantal Ngo",
        phone: "677889900",
        relation: "Mother",
      }),
      stamp(now, {
        id: "sdcontact02",
        personId: "sdperson08",
        name: "Henri Fokou",
        phone: "699112233",
        relation: "Father",
      }),
      stamp(now, {
        id: "sdcontact03",
        personId: "sdperson09",
        name: "Agnes Nyong",
        phone: "677445566",
        relation: "Mother",
      }),
      stamp(now, {
        id: "sdcontact04",
        personId: "sdperson10",
        name: "Peter Kameni",
        phone: "675001122",
        relation: "Father",
      }),
      stamp(now, {
        id: "sdcontact05",
        personId: "sdperson11",
        name: "Ruth Mbe",
        phone: "677667788",
        relation: "Mother",
      }),
      stamp(now, {
        id: "sdcontact06",
        personId: "sdperson12",
        name: "John Tabe",
        phone: "699223344",
        relation: "Father",
      }),
    ]);

    const logins = await upsertSeedLogins(queryInterface);
    const adminId = logins.admin.id;
    const staffId = logins.staff.id;

    await queryInterface.bulkInsert("events", [
      stamp(now, {
        id: "sdevent001",
        title: EVENT_COPY.sdevent001.en.title,
        slug: "yaounde-christmas-camp-2026",
        summary: EVENT_COPY.sdevent001.en.summary,
        description: EVENT_COPY.sdevent001.en.description,
        venue: EVENT_COPY.sdevent001.en.venue,
        city: "Yaoundé",
        startsAt: new Date("2026-12-20T08:00:00.000Z"),
        endsAt: new Date("2026-12-27T16:00:00.000Z"),
        isPublished: true,
        requiresParticipantFee: true,
        participantFeeAmount: "15000.00",
        currency: "XAF",
        coordinatorFundAmount: "50000.00",
        sponsorFundAmount: "100000.00",
        imageUrl: EVENT_COPY.sdevent001.imageUrl,
        createdById: adminId,
      }),
      stamp(now, {
        id: "sdevent002",
        title: EVENT_COPY.sdevent002.en.title,
        slug: "douala-sports-saturday-2026",
        summary: EVENT_COPY.sdevent002.en.summary,
        description: EVENT_COPY.sdevent002.en.description,
        venue: EVENT_COPY.sdevent002.en.venue,
        city: "Douala",
        startsAt: new Date("2026-08-15T08:00:00.000Z"),
        endsAt: new Date("2026-08-15T16:30:00.000Z"),
        isPublished: true,
        requiresParticipantFee: false,
        participantFeeAmount: null,
        currency: "XAF",
        coordinatorFundAmount: "25000.00",
        sponsorFundAmount: null,
        imageUrl: EVENT_COPY.sdevent002.imageUrl,
        createdById: adminId,
      }),
      stamp(now, {
        id: "sdevent003",
        title: EVENT_COPY.sdevent003.en.title,
        slug: "bamenda-easter-retreat-2027",
        summary: EVENT_COPY.sdevent003.en.summary,
        description: EVENT_COPY.sdevent003.en.description,
        venue: EVENT_COPY.sdevent003.en.venue,
        city: "Bamenda",
        startsAt: new Date("2027-04-02T09:00:00.000Z"),
        endsAt: new Date("2027-04-05T14:00:00.000Z"),
        isPublished: false,
        requiresParticipantFee: true,
        participantFeeAmount: "10000.00",
        currency: "XAF",
        coordinatorFundAmount: "30000.00",
        sponsorFundAmount: "40000.00",
        imageUrl: EVENT_COPY.sdevent003.imageUrl,
        createdById: adminId,
      }),
    ]);

    await queryInterface.bulkInsert("mailing_lists", [
      stamp(now, {
        id: "sdlist0001",
        name: "Christmas campers 2026",
        description: "Children invited to the Yaoundé Christmas camp.",
        audienceKind: "camper",
        createdById: adminId,
      }),
      stamp(now, {
        id: "sdlist0002",
        name: "Camp coordinators",
        description: "Adults who run stations and dorms.",
        audienceKind: "coordinator",
        createdById: adminId,
      }),
      stamp(now, {
        id: "sdlist0003",
        name: "Yaoundé church families",
        description: "Mixed list of campers, parents who sponsor, and coordinators in Centre.",
        audienceKind: "mixed",
        createdById: staffId,
      }),
    ]);

    await queryInterface.bulkInsert("mailing_list_members", [
      stamp(now, { id: "sdlmember01", mailingListId: "sdlist0001", personId: "sdperson07" }),
      stamp(now, { id: "sdlmember02", mailingListId: "sdlist0001", personId: "sdperson08" }),
      stamp(now, { id: "sdlmember03", mailingListId: "sdlist0001", personId: "sdperson09" }),
      stamp(now, { id: "sdlmember04", mailingListId: "sdlist0001", personId: "sdperson10" }),
      stamp(now, { id: "sdlmember05", mailingListId: "sdlist0001", personId: "sdperson11" }),
      stamp(now, { id: "sdlmember06", mailingListId: "sdlist0001", personId: "sdperson12" }),
      stamp(now, { id: "sdlmember07", mailingListId: "sdlist0002", personId: "sdperson03" }),
      stamp(now, { id: "sdlmember08", mailingListId: "sdlist0002", personId: "sdperson04" }),
      stamp(now, { id: "sdlmember09", mailingListId: "sdlist0003", personId: "sdperson05" }),
      stamp(now, { id: "sdlmember10", mailingListId: "sdlist0003", personId: "sdperson07" }),
      stamp(now, { id: "sdlmember11", mailingListId: "sdlist0003", personId: "sdperson04" }),
    ]);

    await queryInterface.bulkInsert("event_memberships", [
      stamp(now, {
        id: "sdmem00001",
        eventId: "sdevent001",
        personId: "sdperson07",
        kind: "camper",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00002",
        eventId: "sdevent001",
        personId: "sdperson08",
        kind: "camper",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00003",
        eventId: "sdevent001",
        personId: "sdperson09",
        kind: "camper",
        status: "invited",
      }),
      stamp(now, {
        id: "sdmem00004",
        eventId: "sdevent001",
        personId: "sdperson10",
        kind: "camper",
        status: "invited",
      }),
      stamp(now, {
        id: "sdmem00005",
        eventId: "sdevent001",
        personId: "sdperson11",
        kind: "camper",
        status: "cancelled",
      }),
      stamp(now, {
        id: "sdmem00006",
        eventId: "sdevent001",
        personId: "sdperson03",
        kind: "coordinator",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00007",
        eventId: "sdevent001",
        personId: "sdperson04",
        kind: "coordinator",
        status: "invited",
      }),
      stamp(now, {
        id: "sdmem00008",
        eventId: "sdevent001",
        personId: "sdperson05",
        kind: "sponsor",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00009",
        eventId: "sdevent002",
        personId: "sdperson08",
        kind: "camper",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00010",
        eventId: "sdevent002",
        personId: "sdperson12",
        kind: "camper",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00011",
        eventId: "sdevent002",
        personId: "sdperson02",
        kind: "coordinator",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00012",
        eventId: "sdevent002",
        personId: "sdperson06",
        kind: "sponsor",
        status: "registered",
      }),
      stamp(now, {
        id: "sdmem00013",
        eventId: "sdevent003",
        personId: "sdperson10",
        kind: "camper",
        status: "invited",
      }),
      stamp(now, {
        id: "sdmem00014",
        eventId: "sdevent003",
        personId: "sdperson03",
        kind: "coordinator",
        status: "invited",
      }),
    ]);

    await queryInterface.bulkInsert("invitation_batches", [
      stamp(now, {
        id: "sdbatch001",
        eventId: "sdevent001",
        mailingListId: "sdlist0001",
        kind: "camper",
        subject: "You are invited to Yaoundé Christmas Camp 2026",
        body: "Dear family, we would love Amina and friends to join camp in Nlongkak from 20 to 27 December. Reply to this invitation to confirm a place.",
        sentById: adminId,
        status: "sent",
        sentAt,
      }),
      stamp(now, {
        id: "sdbatch002",
        eventId: "sdevent001",
        mailingListId: "sdlist0002",
        kind: "coordinator",
        subject: "Coordinator briefing: Christmas Camp",
        body: "Please confirm if you can lead a station at the Yaoundé Christmas camp. Arrival is 19 December for setup.",
        sentById: adminId,
        status: "sent",
        sentAt,
      }),
      stamp(now, {
        id: "sdbatch003",
        eventId: "sdevent003",
        mailingListId: null,
        kind: "camper",
        subject: "Draft: Bamenda Easter Retreat",
        body: "This batch is still a draft. Do not send until the programme is published.",
        sentById: staffId,
        status: "draft",
        sentAt: null,
      }),
    ]);

    await queryInterface.bulkInsert("content_translations", [
      ...translationRows(now, "event", "sdevent001", {
        en: EVENT_COPY.sdevent001.en,
        fr: EVENT_COPY.sdevent001.fr,
      }),
      ...translationRows(now, "event", "sdevent002", {
        en: EVENT_COPY.sdevent002.en,
        fr: EVENT_COPY.sdevent002.fr,
      }),
      ...translationRows(now, "event", "sdevent003", {
        en: EVENT_COPY.sdevent003.en,
        fr: EVENT_COPY.sdevent003.fr,
      }),
      ...translationRows(now, "mailing_list", "sdlist0001", {
        en: {
          name: "Christmas campers 2026",
          description: "Children invited to the Yaoundé Christmas camp.",
        },
        fr: {
          name: "Campeurs de Noël 2026",
          description: "Enfants invités au camp de Noël de Yaoundé.",
        },
      }),
      ...translationRows(now, "mailing_list", "sdlist0002", {
        en: {
          name: "Camp coordinators",
          description: "Adults who run stations and dorms.",
        },
        fr: {
          name: "Coordinateurs de camp",
          description: "Adultes qui animent les ateliers et les dortoirs.",
        },
      }),
      ...translationRows(now, "mailing_list", "sdlist0003", {
        en: {
          name: "Yaoundé church families",
          description:
            "Mixed list of campers, parents who sponsor, and coordinators in Centre.",
        },
        fr: {
          name: "Familles d'églises de Yaoundé",
          description:
            "Liste mixte de campeurs, de parents parrains et de coordinateurs du Centre.",
        },
      }),
      ...translationRows(now, "invitation_batch", "sdbatch001", {
        en: {
          subject: "You are invited to Yaoundé Christmas Camp 2026",
          body: "Dear family, we would love Amina and friends to join camp in Nlongkak from 20 to 27 December. Reply to this invitation to confirm a place.",
        },
        fr: {
          subject: "Vous êtes invités au camp de Noël de Yaoundé 2026",
          body: "Chère famille, nous serions heureux qu'Amina et ses amis rejoignent le camp à Nlongkak du 20 au 27 décembre. Répondez à cette invitation pour confirmer une place.",
        },
      }),
      ...translationRows(now, "invitation_batch", "sdbatch002", {
        en: {
          subject: "Coordinator briefing: Christmas Camp",
          body: "Please confirm if you can lead a station at the Yaoundé Christmas camp. Arrival is 19 December for setup.",
        },
        fr: {
          subject: "Briefing des coordinateurs: Camp de Noël",
          body: "Merci de confirmer si vous pouvez animer un atelier au camp de Noël de Yaoundé. Arrivée le 19 décembre pour l'installation.",
        },
      }),
      ...translationRows(now, "invitation_batch", "sdbatch003", {
        en: {
          subject: "Draft: Bamenda Easter Retreat",
          body: "This batch is still a draft. Do not send until the programme is published.",
        },
        fr: {
          subject: "Brouillon : retraite de Pâques à Bamenda",
          body: "Ce lot est encore un brouillon. Ne l'envoyez pas avant la publication du programme.",
        },
      }),
    ]);

    await queryInterface.bulkInsert("invitations", [
      stamp(now, {
        id: "sdinvite01",
        batchId: "sdbatch001",
        eventId: "sdevent001",
        personId: "sdperson07",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "amina.ngo@seed.kidsevent.cm",
        status: "accepted",
        sentAt,
        acceptedAt,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite02",
        batchId: "sdbatch001",
        eventId: "sdevent001",
        personId: "sdperson08",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "daniel.fokou@seed.kidsevent.cm",
        status: "accepted",
        sentAt,
        acceptedAt,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite03",
        batchId: "sdbatch001",
        eventId: "sdevent001",
        personId: "sdperson09",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "blessing.nyong@seed.kidsevent.cm",
        status: "sent",
        sentAt,
        acceptedAt: null,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite04",
        batchId: "sdbatch001",
        eventId: "sdevent001",
        personId: "sdperson10",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "joel.kameni@seed.kidsevent.cm",
        status: "sent",
        sentAt,
        acceptedAt: null,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite05",
        batchId: "sdbatch001",
        eventId: "sdevent001",
        personId: "sdperson11",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "sarah.mbe@seed.kidsevent.cm",
        status: "expired",
        sentAt,
        acceptedAt: null,
        expiresAt: new Date("2026-09-10T00:00:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite06",
        batchId: "sdbatch002",
        eventId: "sdevent001",
        personId: "sdperson03",
        kind: "coordinator",
        token: nanoid(),
        emailSnapshot: "esther.fon@seed.kidsevent.cm",
        status: "accepted",
        sentAt,
        acceptedAt,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite07",
        batchId: "sdbatch002",
        eventId: "sdevent001",
        personId: "sdperson04",
        kind: "coordinator",
        token: nanoid(),
        emailSnapshot: "jp.mbarga@seed.kidsevent.cm",
        status: "queued",
        sentAt: null,
        acceptedAt: null,
        expiresAt: new Date("2026-12-19T23:59:00.000Z"),
      }),
      stamp(now, {
        id: "sdinvite08",
        batchId: "sdbatch003",
        eventId: "sdevent003",
        personId: "sdperson10",
        kind: "camper",
        token: nanoid(),
        emailSnapshot: "joel.kameni@seed.kidsevent.cm",
        status: "queued",
        sentAt: null,
        acceptedAt: null,
        expiresAt: new Date("2027-03-20T00:00:00.000Z"),
      }),
    ]);

    await queryInterface.bulkInsert("payments", [
      stamp(now, {
        id: "sdpay00001",
        eventId: "sdevent001",
        personId: "sdperson07",
        kind: "participant_fee",
        amount: "15000.00",
        currency: "XAF",
        status: "paid",
        providerRef: "CAMPAY-DEMO-AMINA",
      }),
      stamp(now, {
        id: "sdpay00002",
        eventId: "sdevent001",
        personId: "sdperson08",
        kind: "participant_fee",
        amount: "15000.00",
        currency: "XAF",
        status: "pending",
        providerRef: null,
      }),
      stamp(now, {
        id: "sdpay00003",
        eventId: "sdevent001",
        personId: "sdperson09",
        kind: "participant_fee",
        amount: "15000.00",
        currency: "XAF",
        status: "failed",
        providerRef: "CAMPAY-DEMO-BLESSING",
      }),
      stamp(now, {
        id: "sdpay00004",
        eventId: "sdevent001",
        personId: "sdperson11",
        kind: "participant_fee",
        amount: "15000.00",
        currency: "XAF",
        status: "waived",
        providerRef: null,
      }),
      stamp(now, {
        id: "sdpay00005",
        eventId: "sdevent001",
        personId: "sdperson05",
        kind: "sponsor_fund",
        amount: "100000.00",
        currency: "XAF",
        status: "paid",
        providerRef: "CAMPAY-DEMO-GRACE",
      }),
      stamp(now, {
        id: "sdpay00006",
        eventId: "sdevent001",
        personId: "sdperson03",
        kind: "coordinator_fund",
        amount: "50000.00",
        currency: "XAF",
        status: "pending",
        providerRef: null,
      }),
      stamp(now, {
        id: "sdpay00007",
        eventId: "sdevent002",
        personId: "sdperson06",
        kind: "sponsor_fund",
        amount: "25000.00",
        currency: "XAF",
        status: "paid",
        providerRef: "BANK-EWANE-AUG",
      }),
    ]);

    await queryInterface.bulkInsert("audit_logs", [
      {
        id: "sdaudit001",
        actorId: adminId,
        action: "create",
        entity: "events",
        entityId: "sdevent001",
        changes: JSON.stringify({ title: "Yaoundé Christmas Camp 2026" }),
        metadata: JSON.stringify({ source: "seed" }),
        createdAt: now,
      },
      {
        id: "sdaudit002",
        actorId: adminId,
        action: "create",
        entity: "people",
        entityId: "sdperson07",
        changes: JSON.stringify({ email: "amina.ngo@seed.kidsevent.cm" }),
        metadata: JSON.stringify({ source: "seed" }),
        createdAt: now,
      },
      {
        id: "sdaudit003",
        actorId: adminId,
        action: "queue",
        entity: "invitation-batches",
        entityId: "sdbatch001",
        changes: JSON.stringify({ status: "sent", kind: "camper" }),
        metadata: JSON.stringify({ source: "seed" }),
        createdAt: sentAt,
      },
    ]);

    console.info("Seed logins (password from SEED_PASSWORD in .env):");
    for (const account of Object.values(SEED_LOGINS)) {
      console.info(`  ${account.role.padEnd(12)} ${account.email}`);
    }
  },

  async down(queryInterface) {
    await clearSeed(queryInterface);
  },
};
