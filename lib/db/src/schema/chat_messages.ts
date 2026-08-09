import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { studentProfilesTable } from "./student_profiles";
import { lessonsTable } from "./lessons";

export const chatRoleEnum = pgEnum("chat_role", ["student", "assistant"]);

export const chatMessagesTable = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .references(() => studentProfilesTable.id, { onDelete: "cascade" })
    .notNull(),
  lessonId: uuid("lesson_id")
    .references(() => lessonsTable.id, { onDelete: "cascade" })
    .notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({
  id: true,
  createdAt: true,
});

export const selectChatMessageSchema = createSelectSchema(chatMessagesTable);

export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
