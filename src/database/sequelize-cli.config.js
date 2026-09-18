require("dotenv").config();

const shared = {
  username: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "kids_event_cameroon",
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT) || 3306,
  dialect: "mysql",
};

module.exports = {
  development: shared,
  test: { ...shared, database: process.env.MYSQL_TEST_DATABASE || "kids_event_cameroon_test" },
  production: shared,
};
