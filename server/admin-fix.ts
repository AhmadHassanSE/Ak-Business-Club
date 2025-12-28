// Temporary endpoint to fix admin password - should be removed after use
// This is only for initial setup on Railway

import { Router } from "express";
import { storage } from "./storage";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const router = Router();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// IMPORTANT: Delete this endpoint after running it once!
router.post("/api/admin/fix-password", async (req, res) => {
  try {
    const { secret } = req.body;
    
    // Security check - require a secret token
    if (secret !== process.env.ADMIN_SECRET || !process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Delete old admin user
    await db.delete(users).where(eq(users.username, "admin"));
    
    // Create new admin with properly hashed password
    const hashedPassword = await hashPassword("admin123");
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
      })
      .returning();
    
    res.json({
      message: "Admin password fixed successfully",
      username: admin.username,
      note: "Please delete this endpoint from the code for security",
    });
  } catch (err) {
    console.error("Error fixing password:", err);
    res.status(500).json({ message: "Error fixing password" });
  }
});

export default router;
