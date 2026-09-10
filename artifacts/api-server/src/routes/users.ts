import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, eq, and } from "@workspace/db";
import {
  usersTable,
  organizationMembershipsTable,
  membershipRolesTable,
  studentsTable,
  parentsTable,
} from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const usersRouter = Router({ mergeParams: true });

usersRouter.use(requireAuth);

/**
 * GET /api/organizations/:orgSlug/users
 * Returns list of users in the school organization with role badges and profile details
 */
usersRouter.get("/", requireOrganizationRole("ADMIN", "ADVISOR"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const roleFilter = (req.query.role as string)?.toUpperCase();

    // Fetch memberships in this organization
    const memberships = await db
      .select({
        membershipId: organizationMembershipsTable.id,
        userId: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        phone: usersTable.phone,
        photoUrl: usersTable.photoUrl,
        isActive: usersTable.isActive,
        status: organizationMembershipsTable.status,
        createdAt: organizationMembershipsTable.createdAt,
        roleId: membershipRolesTable.roleId,
      })
      .from(organizationMembershipsTable)
      .innerJoin(usersTable, eq(organizationMembershipsTable.userId, usersTable.id))
      .innerJoin(
        membershipRolesTable,
        eq(membershipRolesTable.organizationMembershipId, organizationMembershipsTable.id)
      )
      .where(eq(organizationMembershipsTable.organizationId, orgId));

    // Fetch all student profiles in this organization
    const students = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.organizationId, orgId));

    // Group memberships by user
    const userMap = new Map<string, any>();
    for (const item of memberships) {
      if (!userMap.has(item.userId)) {
        const studentProf = students.find((s) => s.userId === item.userId);
        userMap.set(item.userId, {
          id: item.userId,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          photoUrl: item.photoUrl,
          isActive: item.isActive,
          membershipId: item.membershipId,
          status: item.status,
          createdAt: item.createdAt,
          roles: [],
          studentProfile: studentProf
            ? {
                id: studentProf.id,
                studentIdentifier: studentProf.studentIdentifier,
                grade: studentProf.grade,
              }
            : null,
        });
      }
      const entry = userMap.get(item.userId);
      if (!entry.roles.includes(item.roleId)) {
        entry.roles.push(item.roleId);
      }
    }

    let userList = Array.from(userMap.values());

    if (roleFilter && roleFilter !== "ALL") {
      userList = userList.filter((u) => u.roles.includes(roleFilter));
    }

    res.json(userList);
  } catch (err: any) {
    console.error("List organization users error:", err);
    res.status(500).json({ message: "Failed to load user roster." });
  }
});

/**
 * GET /api/organizations/:orgSlug/users/:userId
 * Retrieves profile of a specific user in the organization
 */
usersRouter.get("/:userId", requireOrganizationRole("ADMIN", "ADVISOR"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawUserId = req.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const [membership] = await db
      .select()
      .from(organizationMembershipsTable)
      .where(
        and(
          eq(organizationMembershipsTable.organizationId, orgId),
          eq(organizationMembershipsTable.userId, userId)
        )
      )
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "User is not a member of this organization." });
      return;
    }

    const rolesRows = await db
      .select({ roleId: membershipRolesTable.roleId })
      .from(membershipRolesTable)
      .where(eq(membershipRolesTable.organizationMembershipId, membership.id));

    const roles = rolesRows.map((r) => r.roleId);

    const [studentProfile] = await db
      .select()
      .from(studentsTable)
      .where(
        and(
          eq(studentsTable.organizationId, orgId),
          eq(studentsTable.userId, userId)
        )
      )
      .limit(1);

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      photoUrl: user.photoUrl,
      isActive: user.isActive,
      membershipId: membership.id,
      roles,
      studentProfile: studentProfile
        ? {
            id: studentProfile.id,
            studentIdentifier: studentProfile.studentIdentifier,
            grade: studentProfile.grade,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Failed to fetch user details." });
  }
});

/**
 * POST /api/organizations/:orgSlug/users
 * Manual onboarding endpoint for Admins to create a user and assign roles
 */
usersRouter.post("/", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const { fullName, email, role, grade, studentIdentifier } = req.body;

    if (!fullName || !email || !role) {
      res.status(400).json({ message: "Full name, email, and role are required." });
      return;
    }

    const cleanRole = role.toUpperCase();
    if (!["ADMIN", "ADVISOR", "STUDENT", "PARENT"].includes(cleanRole)) {
      res.status(400).json({ message: "Invalid role specified." });
      return;
    }

    const defaultPasswordHash = await bcrypt.hash("GuidrPass123!", 10);

    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(usersTable)
        .values({
          email: email.toLowerCase().trim(),
          fullName,
          passwordHash: defaultPasswordHash,
          isActive: true,
        })
        .returning();
    }

    let [membership] = await db
      .select()
      .from(organizationMembershipsTable)
      .where(
        and(
          eq(organizationMembershipsTable.organizationId, orgId),
          eq(organizationMembershipsTable.userId, user.id)
        )
      )
      .limit(1);

    if (!membership) {
      [membership] = await db
        .insert(organizationMembershipsTable)
        .values({
          organizationId: orgId,
          userId: user.id,
          status: "active",
        })
        .returning();
    }

    await db
      .insert(membershipRolesTable)
      .values({
        organizationMembershipId: membership.id,
        roleId: cleanRole,
      })
      .onConflictDoNothing();

    if (cleanRole === "STUDENT") {
      const stuId = studentIdentifier || `STU-${Date.now().toString().slice(-4)}`;
      const [existingStudent] = await db
        .select()
        .from(studentsTable)
        .where(
          and(
            eq(studentsTable.organizationId, orgId),
            eq(studentsTable.studentIdentifier, stuId)
          )
        )
        .limit(1);

      if (!existingStudent) {
        await db.insert(studentsTable).values({
          organizationId: orgId,
          userId: user.id,
          studentIdentifier: stuId,
          grade: Number(grade) || 10,
          status: "active",
        });
      }
    } else if (cleanRole === "PARENT") {
      const [existingParent] = await db
        .select()
        .from(parentsTable)
        .where(
          and(
            eq(parentsTable.organizationId, orgId),
            eq(parentsTable.userId, user.id)
          )
        )
        .limit(1);

      if (!existingParent) {
        await db.insert(parentsTable).values({
          organizationId: orgId,
          userId: user.id,
        });
      }
    }

    res.status(201).json({
      message: "User successfully added to organization roster.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: cleanRole,
      },
    });
  } catch (err: any) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Failed to create user." });
  }
});

/**
 * PATCH /api/organizations/:orgSlug/users/:userId
 * Updates user profile details
 */
usersRouter.patch("/:userId", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const { fullName, phone, grade } = req.body;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (fullName || phone !== undefined) {
      await db
        .update(usersTable)
        .set({
          ...(fullName && { fullName }),
          ...(phone !== undefined && { phone }),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));
    }

    if (grade !== undefined) {
      await db
        .update(studentsTable)
        .set({
          grade: Number(grade),
          updatedAt: new Date(),
        })
        .where(eq(studentsTable.userId, userId));
    }

    res.json({ message: "User details updated successfully" });
  } catch (err: any) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user." });
  }
});

export default usersRouter;
