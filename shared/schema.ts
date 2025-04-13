import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isOrganizer: boolean("is_organizer").default(false).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  organizerId: integer("organizer_id").notNull(),
  categoryId: integer("category_id").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  hasSeating: boolean("has_seating").default(false).notNull(),
  seatingMap: json("seating_map"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ticket types
export const ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull(),
  available: integer("available").notNull(),
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  status: text("status").notNull().default("completed"),
});

// Purchase items table
export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").notNull(),
  ticketTypeId: integer("ticket_type_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  seatInfo: json("seat_info"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertTicketTypeSchema = createInsertSchema(ticketTypes).omit({
  id: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
  status: true,
});

export const insertPurchaseItemSchema = createInsertSchema(purchaseItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type TicketType = typeof ticketTypes.$inferSelect;
export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = z.infer<typeof insertPurchaseItemSchema>;

// Extended event type with related data
export type EventWithDetails = Event & {
  organizer: User;
  category: Category;
  ticketTypes: TicketType[];
};

// Extended purchase type with related data
export type PurchaseWithDetails = Purchase & {
  event: Event;
  items: (PurchaseItem & { ticketType: TicketType })[];
};
