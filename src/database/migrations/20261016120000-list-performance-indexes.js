"use strict";

const { ensureIndex } = require("../migration-guard");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await ensureIndex(queryInterface, "people", ["category"], {
      name: "people_category",
    });
    await ensureIndex(queryInterface, "people", ["importedAt"], {
      name: "people_imported_at",
    });
    await ensureIndex(queryInterface, "people", ["fullName"], {
      name: "people_full_name",
    });
    await ensureIndex(queryInterface, "invitations", ["personId"], {
      name: "invitations_person_id",
    });
    await ensureIndex(queryInterface, "invitations", ["status"], {
      name: "invitations_status",
    });
    await ensureIndex(
      queryInterface,
      "event_memberships",
      ["kind", "status"],
      { name: "event_memberships_kind_status" }
    );
    await ensureIndex(queryInterface, "payments", ["status"], {
      name: "payments_status",
    });
    await ensureIndex(queryInterface, "waiting_list", ["status"], {
      name: "waiting_list_status",
    });
  },

  async down() {
    // Keep indexes; dropping them would slow production lists again.
  },
};
