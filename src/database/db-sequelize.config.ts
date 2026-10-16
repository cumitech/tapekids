import mysql from "mysql2";
import { Sequelize } from "sequelize";

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value == null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const sequelize = new Sequelize(
  env("MYSQL_DATABASE", "kids_event_cameroon"),
  env("MYSQL_USER", "root"),
  process.env.MYSQL_PASSWORD ?? "",
  {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    dialectModule: mysql,
    logging:
      process.env.DEBUG_SQL === "1"
        ? (sql) => {
            console.info(`[SQL] ${sql.slice(0, 120)}${sql.length > 120 ? "…" : ""}`);
          }
        : false,
    benchmark: process.env.DEBUG_SQL === "1",
    pool: {
      max: Number(process.env.MYSQL_POOL_MAX) || 10,
      min: 0,
      acquire: 20_000,
      idle: 10_000,
    },
  }
);

let connecting: Promise<void> | null = null;

/**
 * Authenticate once per process. Do not call sync() here. Schema belongs in migrations.
 */
export async function ensureDb(): Promise<void> {
  if (!connecting) {
    connecting = (async () => {
      const { initEntities } = await import("@/data/entities");
      initEntities();
      await sequelize.authenticate();
    })();
  }

  await connecting;
}
