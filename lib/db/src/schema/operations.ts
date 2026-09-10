import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organizations";
import { clubsTable } from "./clubs";
import { organizationMembershipsTable } from "./memberships";
import { studentsTable } from "./people";

/**
 * Announcements Table
 * Section 14.17 in Guidr V1 Specification
 */
export const announcementsTable = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  clubId: uuid("club_id").references(() => clubsTable.id, { onDelete: "cascade" }),
  authorMembershipId: uuid("author_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Resources Table
 * Section 14.18 in Guidr V1 Specification
 */
export const resourcesTable = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  clubId: uuid("club_id").references(() => clubsTable.id, { onDelete: "cascade" }),
  uploadedByMembershipId: uuid("uploaded_by_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  resourceType: varchar("resource_type", { length: 50 }).default("document").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Badges Catalog Table
 * Section 14.19 in Guidr V1 Specification
 */
export const badgesTable = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Student Awarded Badges Table
 * Section 14.20 in Guidr V1 Specification
 */
export const studentBadgesTable = pgTable("student_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  badgeId: uuid("badge_id")
    .notNull()
    .references(() => badgesTable.id, { onDelete: "cascade" }),
  clubId: uuid("club_id").references(() => clubsTable.id, { onDelete: "set null" }),
  awardedByMembershipId: uuid("awarded_by_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
  note: text("note"),
});

/**
 * Notifications Table
 * Section 14.21 in Guidr V1 Specification
 */
export const notificationsTable = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  recipientMembershipId: uuid("recipient_membership_id")
    .notNull()
    .references(() => organizationMembershipsTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  entityType: varchar("entity_type", { length: 100 }), // Club, Membership, Announcement, Session
  entityId: uuid("entity_id"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
