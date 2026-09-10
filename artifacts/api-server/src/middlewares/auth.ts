import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  organizationMembershipsTable,
  membershipRolesTable,
  organizationsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
}

export interface OrganizationContext {
  organizationId: string;
  organizationSlug: string;
  membershipId: string;
  roles: string[]; // ADMIN, ADVISOR, STUDENT, PARENT
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      orgContext?: OrganizationContext;
    }
  }
}

/**
 * Extracts authenticated user from session / cookie / header
 */
export async function getUserFromSession(req: Request): Promise<AuthenticatedUser | null> {
  const userId = req.cookies?.guidr_user_id || req.headers["x-guidr-user-id"];
  const userIdStr = Array.isArray(userId) ? userId[0] : userId;
  if (!userIdStr || typeof userIdStr !== "string") {
    return null;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userIdStr))
    .limit(1);

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}

/**
 * Validates tenant access & populates req.orgContext for a given organization
 */
export async function getOrganizationContext(
  userId: string,
  organizationSlugOrId: string
): Promise<OrganizationContext | null> {
  // Find organization by slug or ID
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(
      organizationSlugOrId.includes("-")
        ? eq(organizationsTable.slug, organizationSlugOrId)
        : eq(organizationsTable.id, organizationSlugOrId)
    )
    .limit(1);

  if (!org || !org.isActive) return null;

  // Find user membership in this organization
  const [membership] = await db
    .select()
    .from(organizationMembershipsTable)
    .where(
      and(
        eq(organizationMembershipsTable.organizationId, org.id),
        eq(organizationMembershipsTable.userId, userId),
        eq(organizationMembershipsTable.status, "active")
      )
    )
    .limit(1);

  if (!membership) return null;

  // Fetch all roles for this organization membership
  const rolesRows = await db
    .select({ roleId: membershipRolesTable.roleId })
    .from(membershipRolesTable)
    .where(eq(membershipRolesTable.organizationMembershipId, membership.id));

  const roles = rolesRows.map((r) => r.roleId);

  return {
    organizationId: org.id,
    organizationSlug: org.slug,
    membershipId: membership.id,
    roles,
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await getUserFromSession(req);
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  req.user = user;
  next();
}

/**
 * Middleware requiring membership and specific role(s) in an organization tenant
 */
export function requireOrganizationRole(...allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const orgHeader = req.headers["x-organization-slug"];
    const orgSlugHeader = Array.isArray(orgHeader) ? orgHeader[0] : orgHeader;
    const rawOrgParam = req.params.orgSlug || req.params.orgId || orgSlugHeader;
    const orgParam = Array.isArray(rawOrgParam) ? rawOrgParam[0] : rawOrgParam;

    if (!orgParam || typeof orgParam !== "string") {
      res.status(400).json({ message: "Organization context required" });
      return;
    }

    const orgContext = await getOrganizationContext(req.user.id, orgParam);
    if (!orgContext) {
      res.status(403).json({ message: "Access denied to organization" });
      return;
    }

    const hasRole = allowedRoles.some((role) => orgContext.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ message: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}` });
      return;
    }

    req.orgContext = orgContext;
    next();
  };
}
