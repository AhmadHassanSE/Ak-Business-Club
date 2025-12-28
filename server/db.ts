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
    // For Railway and other hosted databases, use SSL without strict verification
    // Railway uses self-signed certs, so we need rejectUnauthorized: false
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  // For Railway internal connections, increase connection timeout
  if (isRailway) {
    poolConfig.connectionTimeoutMillis = 10000; // 10 seconds
    poolConfig.idleTimeoutMillis = 30000; // 30 seconds
    poolConfig.max = 10; // Connection pool size
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
export async function waitForDatabase(maxAttempts?: number, delayMs?: number): Promise<boolean> {
  if (!pool) {
    console.warn("Database pool not initialized. Skipping connection wait.");
    return false;
  }

  // For Railway, use more attempts with longer delays since DNS resolution takes time
  const isRailway = process.env.DATABASE_URL?.includes("railway.internal");
  const attempts = maxAttempts || (isRailway ? 60 : 30);
  const delay = delayMs || (isRailway ? 2000 : 1000);

  // eslint-disable-next-line no-console
  console.log(`Starting database connection attempts (${attempts} attempts, ${delay}ms delay)...`);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT NOW()");
      client.release();
      // eslint-disable-next-line no-console
      console.log("✓ Database connection established successfully at", result.rows[0].now);
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isNetworkError = errorMsg.includes("ENOTFOUND") || errorMsg.includes("ECONNREFUSED") || errorMsg.includes("timeout") || errorMsg.includes("getaddrinfo");
      
      // eslint-disable-next-line no-console
      console.log(`Attempt ${attempt}/${attempts}: Database connection failed - ${errorMsg}`);
      
      if (attempt === attempts) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to connect to database after maximum attempts");
        if (isNetworkError) {
          // eslint-disable-next-line no-console
          console.error("Network error detected. Troubleshooting:");
          // eslint-disable-next-line no-console
          console.error("  1. Check DATABASE_URL format: postgresql://user:pass@host:port/db");
          // eslint-disable-next-line no-console
          console.error("  2. For Railway: Verify PostgreSQL service is running in the same project");
          // eslint-disable-next-line no-console
          console.error("  3. Check that services are linked (they should share the same environment)");
          // eslint-disable-next-line no-console
          console.error("  4. Try redeploying both services together");
        }
        return false;
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}
