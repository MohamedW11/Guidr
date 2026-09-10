import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Global User Identity Table
 * Section 14.1 in Guidr V1 Specification
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  photoUrl: text("photo_url"),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
