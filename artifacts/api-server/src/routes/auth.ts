import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  usersTable,
  organizationMembershipsTable,
  membershipRolesTable,
  organizationsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromSession } from "../middlewares/auth.js";

const authRouter = Router();

/**
 * POST /api/auth/login
 * Multi-tenant authentication endpoint
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.passwordHash || !user.isActive) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Set HTTP-only session cookie
    res.cookie("guidr_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Fetch user's organization memberships & assigned roles
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
        eq(organizationMembershipsTable.userId, user.id)
      );

    // Group memberships by organization
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

    const userOrganizations = Array.from(orgMap.values());

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      organizations: userOrganizations,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: "An unexpected authentication error occurred." });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("guidr_user_id");
  res.json({ message: "Logged out successfully" });
});

/**
 * GET /api/auth/me
 * Retrieves active session & memberships
 */
authRouter.get("/me", async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      res.status(401).json({ message: "Unauthenticated" });
      return;
    }

    // Fetch memberships
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
      .where(eq(organizationMembershipsTable.userId, user.id));

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

    res.json({
      user,
      organizations: Array.from(orgMap.values()),
    });
  } catch (err: any) {
    console.error("Auth /me error:", err);
    res.status(500).json({ message: "Failed to retrieve user session." });
  }
});

export default authRouter;
