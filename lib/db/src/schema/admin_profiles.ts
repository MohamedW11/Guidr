import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const adminRoleEnum = pgEnum("admin_role", ["admin", "super_admin"]);

export const adminProfilesTable = pgTable("admin_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  role: adminRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminProfileSchema = createInsertSchema(adminProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAdminProfileSchema = createSelectSchema(adminProfilesTable);

export type InsertAdminProfile = typeof adminProfilesTable.$inferInsert;
export type AdminProfile = typeof adminProfilesTable.$inferSelect;
