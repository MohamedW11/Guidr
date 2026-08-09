import { pgTable, uuid, text, integer, timestamp, customType } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { lessonsTable } from "./lessons";

// Custom vector column type for pgvector compatibility (1536 dims for embedding model)
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return typeof value === "string" ? JSON.parse(value) : value;
  },
});

export const lessonChunksTable = pgTable("lesson_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .references(() => lessonsTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embedding"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonChunkSchema = createInsertSchema(lessonChunksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectLessonChunkSchema = createSelectSchema(lessonChunksTable);

export type InsertLessonChunk = typeof lessonChunksTable.$inferInsert;
export type LessonChunk = typeof lessonChunksTable.$inferSelect;
