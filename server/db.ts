import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export let pool: pg.Pool | undefined;
export let db: ReturnType<typeof drizzle> | any;

if (!process.env.DATABASE_URL) {
  // Allow running in a "lite" dev mode when no database is configured.
  // This avoids throwing on startup so the frontend can be served.
  // API endpoints that access the database will still fail if called.
  // Developers should set `DATABASE_URL` to connect to Postgres in normal use.
  // eslint-disable-next-line no-console
  console.warn(
    "DATABASE_URL not set. Running in lite mode — database access will be disabled.",
  );
  pool = undefined;
  db = {} as any;
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}
