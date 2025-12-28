import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertUserSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { waitForDatabase } from "./db";

const scryptAsync = promisify(scrypt);

// Email setup (Stub for now, or Ethereal)
// For a real app, user would configure SMTP environment variables.
async function sendOrderEmail(order: any, items: any[]) {
    // For MVP/Lite mode, we log the email content.
    // In production, configure transporter with process.env.SMTP_...
    console.log("--- SENDING EMAIL ---");
    console.log(`To: hranaahmad82@gmai.com`);
    console.log(`Subject: New Order #${order.id}`);
    console.log(`Customer: ${order.customerName} (${order.customerPhone})`);
    console.log(`Address: ${order.customerAddress}`);
    console.log("Items:");
    items.forEach(item => {
        console.log(`- Product ID ${item.productId} x ${item.quantity} @ ${item.price}`);
    });
    console.log(`Total: ${order.totalAmount}`);
    console.log("---------------------");

    // Try sending with Ethereal if possible, or just skip if no config
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or configured host
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        // ... sendMail implementation
    }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
    try {
      // Try to check if tables exist by querying
      await storage.getUserByUsername("nonexistent");
    } catch (err: any) {
      if (err?.code === "42P01") {
        // Table doesn't exist - we need to run migrations
        console.log("Database schema not found. Attempting to create tables...");
        try {
          // Import and run migrations
          const { migrate } = await import("drizzle-orm/node-postgres/migrator");
          const { pool } = await import("./db");
          const path = await import("path");
          const { fileURLToPath } = await import("url");
          
          if (pool) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const migrationsFolder = path.join(__dirname, "../migrations");
            
            try {
              await migrate(pool as any, { migrationsFolder });
              console.log("✓ Database migrations completed");
            } catch (migErr) {
              console.warn("Migration folder not found, attempting to create tables manually...");
              // Migrations don't exist yet, so we'll just try to seed and let drizzle handle it
            }
          }
        } catch (migErr) {
          console.warn("Could not run migrations:", migErr);
        }
      }
    }

    // 1. Ensure Admin User
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (!existingAdmin) {
          const hashedPassword = await hashPassword("admin123");
          await storage.createUser({
              username: "admin",
              password: hashedPassword,
          });
          console.log("Seeded admin user (admin/admin123)");
      }
    } catch (err) {
      console.warn("Could not seed admin user:", err);
    }

    // 2. Ensure Products
    try {
      const products = await storage.getProducts();
      if (products.length === 0) {
          await storage.createProduct({
              name: "Ketchup",
              description: "Fresh tomato ketchup, perfect for fries.",
              price: 250,
              category: "Sauces",
              imageUrl: "https://images.unsplash.com/photo-1606132863925-544439169493?auto=format&fit=crop&q=80&w=800",
              available: true,
          });
          await storage.createProduct({
              name: "Mayonnaise",
              description: "Creamy rich mayonnaise.",
              price: 300,
              category: "Sauces",
              imageUrl: "https://images.unsplash.com/photo-1595356262451-9e7f84266e74?auto=format&fit=crop&q=80&w=800",
              available: true,
          });
          await storage.createProduct({
              name: "Chicken Kabab",
              description: "Spicy and delicious chicken kababs.",
              price: 150,
              category: "Frozen",
              imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54262?auto=format&fit=crop&q=80&w=800",
              available: true,
          });
          console.log("Seeded products");
      }
    } catch (err) {
      console.warn("Could not seed products:", err);
    }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const dbEnabled = !!process.env.DATABASE_URL;

  if (!dbEnabled) {
    console.warn("DATABASE_URL not set — running in lite mode. API endpoints will return 503.");

    // Return 503 for any /api routes so callers get a clear error instead of server crash
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return res.status(503).json({ message: "Service temporarily unavailable (no database)" });
      }
      next();
    });
  } else {
    // Wait for database to be available before attempting to seed
    const dbReady = await waitForDatabase();
    
    if (dbReady) {
      // Seed Data and setup auth (requires DB)
      try {
        await seedDatabase();
      } catch (e) {
        console.error("Error while seeding database:", e);
        // Don't throw - allow the app to start even if seeding fails
        // This allows the API to be available for manual fixes
        console.warn("Continuing startup despite seeding error");
      }
    } else {
      console.error("Database connection failed. Running with limited functionality.");
      // Return 503 for database-dependent routes
      app.use((req, res, next) => {
        if (req.path.startsWith("/api")) {
          return res.status(503).json({ message: "Service temporarily unavailable (database not ready)" });
        }
        next();
      });
    }

    // Set up authentication (Passport) BEFORE registering routes that use it
    // Only if DB is ready
    if (dbReady) {
      setupAuth(app);
    }
  }

  // API Routes
  
  // -- Auth --
  // Handled by setupAuth usually, or defined here.
  // We will define them here using the api contract if setupAuth doesn't do it automatically.
  // Passport setup usually adds the login route. We'll verify.

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt for username:", username);
      
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user) {
        console.log("User not found in database");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // ... rest of login logic
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // -- Products --
  app.get(api.products.list.path, async (req, res) => {
    const { search, category } = req.query;
    const products = await storage.getProducts(search as string, category as string);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const parsed = api.products.create.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation error" });
    
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put(api.products.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const parsed = api.products.update.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation error" });

    const product = await storage.updateProduct(Number(req.params.id), parsed.data);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete(api.products.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const success = await storage.deleteProduct(Number(req.params.id));
    if (!success) return res.status(404).json({ message: "Product not found" });
    res.status(204).end();
  });

  // -- Orders --
  app.post(api.orders.create.path, async (req, res) => {
    const parsed = api.orders.create.input.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Validation error" });
    
    // Calculate total amount from server-side prices to avoid tampering
    let totalAmount = 0;
    const orderItemsData = [];
    
    for (const item of parsed.data.items) {
        const product = await storage.getProduct(item.productId);
        if (!product) return res.status(400).json({ message: `Product ${item.productId} not found` });
        
        totalAmount += product.price * item.quantity;
        orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price, // Snapshot price
            orderId: 0, // Placeholder, set in storage
        });
    }

    const orderData = {
        customerName: parsed.data.customerName,
        customerAddress: parsed.data.customerAddress,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail,
        totalAmount,
        status: "pending",
        createdAt: new Date(),
    };

    const order = await storage.createOrder(orderData, orderItemsData);
    
    // Send Email
    sendOrderEmail(order, orderItemsData).catch(console.error);

    res.status(201).json(order);
  });

  app.get(api.orders.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get(api.orders.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  return httpServer;
}
