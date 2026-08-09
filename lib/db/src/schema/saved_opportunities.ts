import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { studentProfilesTable } from "./student_profiles";
import { opportunitiesTable } from "./opportunities";

export const savedOpportunitiesTable = pgTable(
  "saved_opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .references(() => studentProfilesTable.id, { onDelete: "cascade" })
      .notNull(),
    opportunityId: uuid("opportunity_id")
      .references(() => opportunitiesTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("student_opportunity_unique").on(table.studentId, table.opportunityId),
  ]
);

export const insertSavedOpportunitySchema = createInsertSchema(savedOpportunitiesTable).omit({
  id: true,
  createdAt: true,
});

export const selectSavedOpportunitySchema = createSelectSchema(savedOpportunitiesTable);

export type InsertSavedOpportunity = typeof savedOpportunitiesTable.$inferInsert;
export type SavedOpportunity = typeof savedOpportunitiesTable.$inferSelect;
