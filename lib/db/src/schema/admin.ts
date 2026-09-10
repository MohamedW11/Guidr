import { pgTable, uuid, varchar, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { organizationMembershipsTable } from "./memberships";

/**
 * User Roster Import Jobs Table
 * Section 14.22 in Guidr V1 Specification
 */
export const importJobsTable = pgTable("import_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdByMembershipId: uuid("created_by_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(), // PENDING, PROCESSING, COMPLETED, FAILED
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

/**
 * System Audit Logs Table
 * Section 14.23 in Guidr V1 Specification
 */
export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  actorMembershipId: uuid("actor_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
