import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Multi-Tenant School Organizations Table
 * Section 14.2 in Guidr V1 Specification
 */
export const organizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
