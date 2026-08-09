import { pgTable, uuid, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const studentProfilesTable = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  school: varchar("school", { length: 255 }),
  governorate: varchar("governorate", { length: 100 }),
  grade: integer("grade"),
  interests: text("interests").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStudentProfileSchema = createInsertSchema(studentProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectStudentProfileSchema = createSelectSchema(studentProfilesTable);

export type InsertStudentProfile = typeof studentProfilesTable.$inferInsert;
export type StudentProfile = typeof studentProfilesTable.$inferSelect;
