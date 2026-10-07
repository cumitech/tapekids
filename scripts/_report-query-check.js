require("dotenv").config();
const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    port: Number(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE,
  });
  const [memberships] = await connection.query(
    `SELECT people.category AS category, event_memberships.status AS status, COUNT(*) AS total
     FROM event_memberships
     INNER JOIN people ON people.id = event_memberships.personId
     WHERE event_memberships.kind = 'camper'
       AND event_memberships.status IN ('invited', 'registered')
       AND people.category IN ('trophy_camper', 'trophy_participant')
     GROUP BY people.category, event_memberships.status`
  );
  const [waiting] = await connection.query(
    `SELECT status, COUNT(*) AS total
     FROM waiting_list
     WHERE JSON_UNQUOTE(JSON_EXTRACT(details, '$.eventId')) IS NOT NULL
       AND CHAR_LENGTH(JSON_UNQUOTE(JSON_EXTRACT(details, '$.eventId'))) > 0
     GROUP BY status`
  );
  console.log(JSON.stringify({ memberships, waiting }, null, 2));
  await connection.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
