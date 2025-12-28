import { pool, db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function fixAdminPassword() {
  try {
    console.log("Fixing admin password...");
    
    // Delete existing admin user with plain text password
    await db.delete(users).where(eq(users.username, "admin"));
    console.log("Deleted old admin user");
    
    // Create new admin user with properly hashed password
    const hashedPassword = await hashPassword("admin123");
    console.log("Generated hashed password");
    
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
      })
      .returning();
    
    console.log("✓ Admin user recreated with proper password hash");
    console.log("Admin credentials: username=admin, password=admin123");
    
    process.exit(0);
  } catch (err) {
    console.error("Error fixing password:", err);
    process.exit(1);
  }
}

fixAdminPassword();
