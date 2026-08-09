import { pgTable, uuid, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { studentProfilesTable } from "./student_profiles";
import { lessonsTable } from "./lessons";

export const lessonProgressTable = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .references(() => studentProfilesTable.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessonsTable.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("student_lesson_unique").on(table.studentId, table.lessonId),
  ]
);

export const insertLessonProgressSchema = createInsertSchema(lessonProgressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectLessonProgressSchema = createSelectSchema(lessonProgressTable);

export type InsertLessonProgress = typeof lessonProgressTable.$inferInsert;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
