import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const lessonStatusEnum = pgEnum("lesson_status", ["draft", "published", "locked"]);

export const lessonsTable = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  module: varchar("module", { length: 255 }).notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  status: lessonStatusEnum("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectLessonSchema = createSelectSchema(lessonsTable);

export type InsertLesson = typeof lessonsTable.$inferInsert;
export type Lesson = typeof lessonsTable.$inferSelect;
