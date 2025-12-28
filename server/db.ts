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

  // Determine if we need SSL
  const pgSslMode = process.env.PGSSLMODE || process.env.DB_SSL;
  const isRailway = process.env.DATABASE_URL?.includes("railway.internal");
  const needsSsl = pgSslMode === "require" || pgSslMode === "true" || process.env.DATABASE_URL.includes("sslmode=require") || isRailway;

  if (needsSsl) {
    // For Railway and other hosted databases, use SSL
    const sslStrict = process.env.DB_SSL_STRICT !== "false";
    poolConfig.ssl = sslStrict ? true : { rejectUnauthorized: false };
  }

  // Log connection details for debugging
  const dbUrl = process.env.DATABASE_URL.replace(/([^:]*):([^@]*)@/, "$1:***@");
  // eslint-disable-next-line no-console
  console.log(`Initializing database pool with SSL=${!!poolConfig.ssl}. URL: ${dbUrl}`);

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
      const result = await client.query("SELECT NOW()");
      client.release();
      // eslint-disable-next-line no-console
      console.log("✓ Database connection established successfully at", result.rows[0]);
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isNetworkError = errorMsg.includes("ENOTFOUND") || errorMsg.includes("ECONNREFUSED") || errorMsg.includes("timeout");
      
      // eslint-disable-next-line no-console
      console.log(`Attempt ${attempt}/${maxAttempts}: Database connection failed - ${errorMsg}`);
      
      if (attempt === maxAttempts) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to connect to database after maximum attempts");
        if (isNetworkError) {
          // eslint-disable-next-line no-console
          console.error("This is a network error. Check that:");
          // eslint-disable-next-line no-console
          console.error("  1. DATABASE_URL is correct (format: postgresql://user:pass@host:port/db)");
          // eslint-disable-next-line no-console
          console.error("  2. For Railway: ensure PostgreSQL service is running and linked");
          // eslint-disable-next-line no-console
          console.error("  3. Network connectivity is available to the database host");
        }
        return false;
      }
      
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}
