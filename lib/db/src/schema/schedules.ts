import { pgTable, uuid, varchar, integer, date, timestamp, unique } from "drizzle-orm/pg-core";
import { clubsTable, locationsTable } from "./clubs";
import { studentsTable } from "./people";
import { organizationMembershipsTable } from "./memberships";

/**
 * Club Recurring Schedules Table
 * Section 14.14 in Guidr V1 Specification
 */
export const clubSchedulesTable = pgTable("club_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubsTable.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: varchar("start_time", { length: 10 }).notNull(), // e.g. "15:00"
  endTime: varchar("end_time", { length: 10 }).notNull(),   // e.g. "16:30"
  locationId: uuid("location_id").references(() => locationsTable.id, { onDelete: "set null" }),
  effectiveFrom: date("effective_from"),
  effectiveTo: date("effective_to"),
});

/**
 * Club Sessions Table (Actual Occurrences)
 * Section 14.15 in Guidr V1 Specification
 */
export const clubSessionsTable = pgTable("club_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id")
    .notNull()
    .references(() => clubsTable.id, { onDelete: "cascade" }),
  scheduledDate: date("scheduled_date").notNull(),
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime").notNull(),
  locationId: uuid("location_id").references(() => locationsTable.id, { onDelete: "set null" }),
  status: varchar("status", { length: 50 }).default("SCHEDULED").notNull(), // SCHEDULED, COMPLETED, CANCELLED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Attendance Records Table
 * Section 14.16 in Guidr V1 Specification
 * Status options: PRESENT, ABSENT, LATE, EXCUSED
 */
export const attendanceRecordsTable = pgTable(
  "attendance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubSessionId: uuid("club_session_id")
      .notNull()
      .references(() => clubSessionsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull(), // PRESENT, ABSENT, LATE, EXCUSED
    recordedByMembershipId: uuid("recorded_by_membership_id")
      .notNull()
      .references(() => organizationMembershipsTable.id),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
    updatedByMembershipId: uuid("updated_by_membership_id").references(() => organizationMembershipsTable.id),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("unique_session_student_attendance").on(table.clubSessionId, table.studentId),
  ]
);
