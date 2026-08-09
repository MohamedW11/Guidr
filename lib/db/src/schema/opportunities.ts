import { pgTable, uuid, varchar, text, date, time, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const locationTypeEnum = pgEnum("location_type", ["online", "in_person", "hybrid"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["draft", "active", "archived"]);

export const opportunitiesTable = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  categories: text("categories").array(),
  types: text("types").array(),
  description: text("description").notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  deadlineDate: date("deadline_date"),
  deadlineTime: time("deadline_time"),
  locationType: locationTypeEnum("location_type").notNull().default("online"),
  locationDetails: text("location_details"),
  gradeMin: integer("grade_min"),
  gradeMax: integer("grade_max"),
  specificGrades: integer("specific_grades").array(),
  eligibleGovernorates: text("eligible_governorates").array(),
  genderRequirement: varchar("gender_requirement", { length: 50 }),
  additionalRequirements: text("additional_requirements"),
  timeline: text("timeline"),
  applicationProcess: text("application_process"),
  applicationLink: text("application_link"),
  status: opportunityStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectOpportunitySchema = createSelectSchema(opportunitiesTable);

export type InsertOpportunity = typeof opportunitiesTable.$inferInsert;
export type Opportunity = typeof opportunitiesTable.$inferSelect;
