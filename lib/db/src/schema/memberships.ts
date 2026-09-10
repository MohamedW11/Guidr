import { pgTable, uuid, varchar, timestamp, primaryKey, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { organizationsTable } from "./organizations";

/**
 * Organization Memberships Table
 * Section 14.3 in Guidr V1 Specification
 */
export const organizationMembershipsTable = pgTable(
  "organization_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).default("active").notNull(), // active, suspended, invited
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("unique_org_user").on(table.organizationId, table.userId),
  ]
);

/**
 * Roles Reference Table
 * Section 14.4 in Guidr V1 Specification (ADMIN, ADVISOR, STUDENT, PARENT)
 */
export const rolesTable = pgTable("roles", {
  id: varchar("id", { length: 50 }).primaryKey(), // ADMIN, ADVISOR, STUDENT, PARENT
  name: varchar("name", { length: 100 }).notNull(),
});

/**
 * Membership Roles Mapping Table (Supports Multiple Roles per User per School)
 * Section 14.5 in Guidr V1 Specification
 */
export const membershipRolesTable = pgTable(
  "membership_roles",
  {
    organizationMembershipId: uuid("organization_membership_id")
      .notNull()
      .references(() => organizationMembershipsTable.id, { onDelete: "cascade" }),
    roleId: varchar("role_id", { length: 50 })
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.organizationMembershipId, table.roleId] }),
  ]
);
