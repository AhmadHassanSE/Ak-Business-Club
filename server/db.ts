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
  // Support optional SSL configuration for hosted Postgres (e.g., Railway)
  const poolConfig: any = { connectionString: process.env.DATABASE_URL };

  // PGSSLMODE or DB_SSL env var can be used to toggle SSL behavior.
  const pgSslMode = process.env.PGSSLMODE || process.env.DB_SSL;
  if (pgSslMode === "require" || pgSslMode === "true" || process.env.DATABASE_URL.includes("sslmode=require")) {
    poolConfig.ssl = { rejectUnauthorized: process.env.DB_SSL_STRICT !== "false" };
  }

  try {
    pool = new Pool(poolConfig);
    db = drizzle(pool, { schema });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error initializing database pool:", err);
    throw err;
  }
}

// Helper function to wait for database connection with retry logic
export async function waitForDatabase(maxAttempts = 30, delayMs = 1000): Promise<boolean> {
  if (!pool) {
    console.warn("Database pool not initialized. Skipping connection wait.");
    return false;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT NOW()");
      client.release();
      // eslint-disable-next-line no-console
      console.log("✓ Database connection established successfully");
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`Database connection attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms...`);
      if (attempt === maxAttempts) {
        // eslint-disable-next-line no-console
        console.error("Failed to connect to database after maximum attempts:", err);
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}
