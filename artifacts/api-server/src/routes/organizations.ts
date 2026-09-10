import { Router } from "express";
import { db } from "@workspace/db";
import {
  organizationsTable,
  organizationMembershipsTable,
  membershipRolesTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth.js";

const organizationsRouter = Router();

// Require authentication for all organization routes
organizationsRouter.use(requireAuth);

/**
 * GET /api/organizations
 * Lists all school organization tenants the authenticated user belongs to
 */
organizationsRouter.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;

    const memberships = await db
      .select({
        membershipId: organizationMembershipsTable.id,
        organizationId: organizationsTable.id,
        organizationName: organizationsTable.name,
        organizationSlug: organizationsTable.slug,
        organizationLogoUrl: organizationsTable.logoUrl,
        roleId: membershipRolesTable.roleId,
      })
      .from(organizationMembershipsTable)
      .innerJoin(
        organizationsTable,
        eq(organizationMembershipsTable.organizationId, organizationsTable.id)
      )
      .innerJoin(
        membershipRolesTable,
        eq(
          membershipRolesTable.organizationMembershipId,
          organizationMembershipsTable.id
        )
      )
      .where(
        and(
          eq(organizationMembershipsTable.userId, userId),
          eq(organizationMembershipsTable.status, "active"),
          eq(organizationsTable.isActive, true)
        )
      );

    const orgMap = new Map<string, any>();
    for (const item of memberships) {
      if (!orgMap.has(item.organizationId)) {
        orgMap.set(item.organizationId, {
          id: item.organizationId,
          name: item.organizationName,
          slug: item.organizationSlug,
          logoUrl: item.organizationLogoUrl,
          membershipId: item.membershipId,
          roles: [],
        });
      }
      const orgEntry = orgMap.get(item.organizationId);
      if (!orgEntry.roles.includes(item.roleId)) {
        orgEntry.roles.push(item.roleId);
      }
    }

    res.json(Array.from(orgMap.values()));
  } catch (err: any) {
    console.error("List organizations error:", err);
    res.status(500).json({ message: "Failed to load organizations." });
  }
});

/**
 * GET /api/organizations/:id
 * Fetches organization details if user has active membership
 */
organizationsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check membership
    const [membership] = await db
      .select()
      .from(organizationMembershipsTable)
      .where(
        and(
          eq(organizationMembershipsTable.organizationId, id),
          eq(organizationMembershipsTable.userId, userId),
          eq(organizationMembershipsTable.status, "active")
        )
      )
      .limit(1);

    if (!membership) {
      res.status(403).json({ message: "Access denied to organization" });
      return;
    }

    const [org] = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, id))
      .limit(1);

    if (!org) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    res.json(org);
  } catch (err: any) {
    console.error("Get organization error:", err);
    res.status(500).json({ message: "Failed to fetch organization." });
  }
});

export default organizationsRouter;
