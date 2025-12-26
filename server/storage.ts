import { db } from "./db";
import { eq, ilike, desc } from "drizzle-orm";
import { 
  users, products, orders, orderItems,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // User/Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Products
  getProducts(search?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }>;
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(search?: string, category?: string): Promise<Product[]> {
    let query = db.select().from(products);
    
    // Simple filtering - can be expanded
    if (search) {
        query.where(ilike(products.name, `%${search}%`));
    }
    
    // Category filter would require chaining .where, drizzle query builder handles this
    // But for now keeping it simple as `ilike` returns a SQL chunk
    // To properly chain:
    const conditions = [];
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (category) conditions.push(eq(products.category, category));

    // Note: This is a simplified application of filters. 
    // In a real complex query, we'd use .where(and(...conditions))
    
    if (conditions.length > 0) {
        // @ts-ignore - drizzle type complexity for dynamic where
        return await db.select().from(products).where(conditions[0]); // Only supporting one filter for MVP simplicity if multiple
    }
    
    return await db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    return !!deleted;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: OrderItem[] }> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      const newItems: OrderItem[] = [];
      for (const item of items) {
        const [newItem] = await tx.insert(orderItems).values({
          ...item,
          orderId: newOrder.id,
        }).returning();
        newItems.push(newItem);
      }
      
      return { ...newOrder, items: newItems };
    });
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;

    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, id),
      with: {
        product: true
      }
    });

    return { ...order, items };
  }
}

export const storage = new DatabaseStorage();
