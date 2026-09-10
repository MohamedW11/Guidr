import { pgTable, uuid, varchar, text, integer, date, timestamp, unique } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { organizationMembershipsTable } from "./memberships";
import { studentsTable } from "./people";

/**
 * Locations Table
 * Section 14.10 in Guidr V1 Specification
 */
export const locationsTable = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Clubs Domain Table
 * Section 14.11 in Guidr V1 Specification
 */
export const clubsTable = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  minimumGrade: integer("minimum_grade").notNull(),
  maximumGrade: integer("maximum_grade").notNull(),
  locationId: uuid("location_id").references(() => locationsTable.id, { onDelete: "set null" }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).default("DRAFT").notNull(), // DRAFT, ACTIVE, COMPLETED, ARCHIVED
  createdByMembershipId: uuid("created_by_membership_id").references(() => organizationMembershipsTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Club Advisors Assignment Table
 * Section 14.12 in Guidr V1 Specification
 */
export const clubAdvisorsTable = pgTable(
  "club_advisors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubsTable.id, { onDelete: "cascade" }),
    organizationMembershipId: uuid("organization_membership_id")
      .notNull()
      .references(() => organizationMembershipsTable.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    assignedByMembershipId: uuid("assigned_by_membership_id").references(() => organizationMembershipsTable.id),
    status: varchar("status", { length: 50 }).default("ACTIVE").notNull(),
  },
  (table) => [
    unique("unique_club_advisor").on(table.clubId, table.organizationMembershipId),
  ]
);

/**
 * Club Memberships Lifecycle Table
 * Section 14.13 in Guidr V1 Specification
 * Status lifecycle: PENDING_PARENT_APPROVAL, PARENT_REJECTED, PENDING_ADVISOR_APPROVAL, ADVISOR_REJECTED, ACTIVE, WITHDRAWN, REMOVED, COMPLETED
 */
export const clubMembershipsTable = pgTable("club_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubsTable.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).default("PENDING_PARENT_APPROVAL").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  parentApprovedAt: timestamp("parent_approved_at"),
  parentRejectedAt: timestamp("parent_rejected_at"),
  advisorApprovedAt: timestamp("advisor_approved_at"),
  advisorRejectedAt: timestamp("advisor_rejected_at"),
  withdrawnAt: timestamp("withdrawn_at"),
  removedAt: timestamp("removed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
