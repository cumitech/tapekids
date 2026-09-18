"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("events", "imageUrl", {
      type: Sequelize.STRING(1024),
      allowNull: true,
    });

    const images = {
      sdevent001:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=1200&q=80",
      sdevent002:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=1200&q=80",
      sdevent003:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    };

    for (const [id, imageUrl] of Object.entries(images)) {
      await queryInterface.sequelize.query(
        "UPDATE events SET imageUrl = :imageUrl WHERE id = :id",
        { replacements: { imageUrl, id } }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("events", "imageUrl");
  },
};
