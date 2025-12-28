import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  if (!pool) {
    console.error("Database pool not initialized");
    process.exit(1);
  }

  try {
    console.log("Running database migrations...");
    const migrationsFolder = path.join(__dirname, "../migrations");
    
    // Read all migration files
    const migrationFiles = await readdir(migrationsFolder);
    const sqlFiles = migrationFiles.filter(f => f.endsWith(".sql")).sort();
    
    if (sqlFiles.length === 0) {
      console.log("No migration files found");
      process.exit(0);
    }

    const client = await pool.connect();
    
    try {
      for (const sqlFile of sqlFiles) {
        const filePath = path.join(migrationsFolder, sqlFile);
        const sql = await readFile(filePath, "utf-8");
        
        console.log(`Running migration: ${sqlFile}`);
        await client.query(sql);
        console.log(`✓ Completed: ${sqlFile}`);
      }
      
      console.log("✓ All migrations completed successfully");
    } finally {
      client.release();
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigrations();
