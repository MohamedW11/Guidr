import { pgTable, uuid, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

/**
 * Students Profile Table
 * Section 14.6 in Guidr V1 Specification
 */
export const studentsTable = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    studentIdentifier: varchar("student_identifier", { length: 100 }).notNull(), // School Student ID
    grade: integer("grade").notNull(), // Organization-managed grade level
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("unique_org_student_identifier").on(table.organizationId, table.studentIdentifier),
  ]
);

/**
 * Parents Profile Table
 * Section 14.7 in Guidr V1 Specification
 */
export const parentsTable = pgTable("parents", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Parent-Student Relationship Link Table
 * Section 14.8 in Guidr V1 Specification (Supports Multi-child parents)
 */
export const parentStudentsTable = pgTable(
  "parent_students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parentsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    relationshipType: varchar("relationship_type", { length: 50 }).default("parent").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("unique_parent_student").on(table.parentId, table.studentId),
  ]
);
