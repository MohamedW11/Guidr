import { Router } from "express";
import { db, eq, and, inArray } from "@workspace/db";
import {
  clubMembershipsTable,
  clubsTable,
  studentsTable,
  usersTable,
  parentsTable,
  parentStudentsTable,
  clubAdvisorsTable,
} from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth.js";

const membershipsRouter = Router({ mergeParams: true });

membershipsRouter.use(requireAuth);

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/join
 * Student submits join request for a club. Transitions status to PENDING_PARENT_APPROVAL.
 */
membershipsRouter.post("/clubs/:clubId/join", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    // 1. Fetch student entity for current user
    const [student] = await db
      .select()
      .from(studentsTable)
      .where(and(eq(studentsTable.organizationId, orgId), eq(studentsTable.userId, userId)))
      .limit(1);

    if (!student) {
      res.status(403).json({ message: "Only registered students can submit club join requests." });
      return;
    }

    // 2. Fetch target club details & check status & grade eligibility
    const [club] = await db
      .select()
      .from(clubsTable)
      .where(and(eq(clubsTable.id, clubId), eq(clubsTable.organizationId, orgId)))
      .limit(1);

    if (!club) {
      res.status(404).json({ message: "Club not found." });
      return;
    }

    if (club.status !== "ACTIVE") {
      res.status(400).json({ message: "Cannot join a club that is not active." });
      return;
    }

    if (student.grade < club.minimumGrade || student.grade > club.maximumGrade) {
      res.status(400).json({
        message: `Your grade (${student.grade}) is not within the eligible grade range (${club.minimumGrade} - ${club.maximumGrade}) for this club.`,
      });
      return;
    }

    // 3. Check for existing active/pending membership
    const [existingMembership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(
        and(
          eq(clubMembershipsTable.organizationId, orgId),
          eq(clubMembershipsTable.clubId, clubId),
          eq(clubMembershipsTable.studentId, student.id)
        )
      )
      .limit(1);

    if (existingMembership) {
      if (
        existingMembership.status === "PENDING_PARENT_APPROVAL" ||
        existingMembership.status === "PENDING_ADVISOR_APPROVAL" ||
        existingMembership.status === "ACTIVE"
      ) {
        res.status(400).json({
          message: `You already have an active or pending membership request for this club (Status: ${existingMembership.status}).`,
        });
        return;
      }

      // Re-open/update if previously WITHDRAWN or REJECTED
      const [updated] = await db
        .update(clubMembershipsTable)
        .set({
          status: "PENDING_PARENT_APPROVAL",
          requestedAt: new Date(),
          parentApprovedAt: null,
          parentRejectedAt: null,
          advisorApprovedAt: null,
          advisorRejectedAt: null,
          withdrawnAt: null,
          removedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(clubMembershipsTable.id, existingMembership.id))
        .returning();

      res.status(200).json(updated);
      return;
    }

    // 4. Create new club membership in PENDING_PARENT_APPROVAL state
    const [newMembership] = await db
      .insert(clubMembershipsTable)
      .values({
        organizationId: orgId,
        clubId: clubId,
        studentId: student.id,
        status: "PENDING_PARENT_APPROVAL",
        requestedAt: new Date(),
      })
      .returning();

    res.status(201).json(newMembership);
  } catch (err: any) {
    console.error("Join club error:", err);
    res.status(500).json({ message: "Failed to submit club join request." });
  }
});

/**
 * GET /api/organizations/:orgSlug/club-memberships
 * Query club memberships filtered by role, status, clubId, studentId
 */
membershipsRouter.get("/", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;
    const roles = req.orgContext!.roles;
    const membershipId = req.orgContext!.membershipId;

    const rawStatus = req.query.status as string | undefined;
    const rawClubId = req.query.clubId as string | undefined;
    const rawStudentId = req.query.studentId as string | undefined;

    let queryBuilder = db
      .select({
        id: clubMembershipsTable.id,
        organizationId: clubMembershipsTable.organizationId,
        clubId: clubMembershipsTable.clubId,
        clubName: clubsTable.name,
        minimumGrade: clubsTable.minimumGrade,
        maximumGrade: clubsTable.maximumGrade,
        studentId: clubMembershipsTable.studentId,
        studentIdentifier: studentsTable.studentIdentifier,
        studentGrade: studentsTable.grade,
        studentFullName: usersTable.fullName,
        studentEmail: usersTable.email,
        status: clubMembershipsTable.status,
        requestedAt: clubMembershipsTable.requestedAt,
        parentApprovedAt: clubMembershipsTable.parentApprovedAt,
        parentRejectedAt: clubMembershipsTable.parentRejectedAt,
        advisorApprovedAt: clubMembershipsTable.advisorApprovedAt,
        advisorRejectedAt: clubMembershipsTable.advisorRejectedAt,
        withdrawnAt: clubMembershipsTable.withdrawnAt,
        createdAt: clubMembershipsTable.createdAt,
        updatedAt: clubMembershipsTable.updatedAt,
      })
      .from(clubMembershipsTable)
      .innerJoin(clubsTable, eq(clubMembershipsTable.clubId, clubsTable.id))
      .innerJoin(studentsTable, eq(clubMembershipsTable.studentId, studentsTable.id))
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id));

    const conditions = [eq(clubMembershipsTable.organizationId, orgId)];

    if (rawStatus) {
      conditions.push(eq(clubMembershipsTable.status, rawStatus));
    }
    if (rawClubId) {
      conditions.push(eq(clubMembershipsTable.clubId, rawClubId));
    }
    if (rawStudentId) {
      conditions.push(eq(clubMembershipsTable.studentId, rawStudentId));
    }

    // Role-based authorization scoping
    if (roles.includes("STUDENT") && !roles.includes("ADMIN") && !roles.includes("ADVISOR")) {
      const [student] = await db
        .select()
        .from(studentsTable)
        .where(and(eq(studentsTable.organizationId, orgId), eq(studentsTable.userId, userId)))
        .limit(1);

      if (!student) {
        res.json([]);
        return;
      }
      conditions.push(eq(clubMembershipsTable.studentId, student.id));
    } else if (roles.includes("PARENT") && !roles.includes("ADMIN") && !roles.includes("ADVISOR")) {
      const [parent] = await db
        .select()
        .from(parentsTable)
        .where(and(eq(parentsTable.organizationId, orgId), eq(parentsTable.userId, userId)))
        .limit(1);

      if (!parent) {
        res.json([]);
        return;
      }

      const parentLinks = await db
        .select({ studentId: parentStudentsTable.studentId })
        .from(parentStudentsTable)
        .where(
          and(
            eq(parentStudentsTable.organizationId, orgId),
            eq(parentStudentsTable.parentId, parent.id)
          )
        );

      const linkedStudentIds = parentLinks.map((l) => l.studentId);
      if (linkedStudentIds.length === 0) {
        res.json([]);
        return;
      }

      conditions.push(inArray(clubMembershipsTable.studentId, linkedStudentIds));
    } else if (roles.includes("ADVISOR") && !roles.includes("ADMIN")) {
      // Find clubs this advisor is assigned to
      const assignedClubs = await db
        .select({ clubId: clubAdvisorsTable.clubId })
        .from(clubAdvisorsTable)
        .where(
          and(
            eq(clubAdvisorsTable.organizationMembershipId, membershipId),
            eq(clubAdvisorsTable.status, "ACTIVE")
          )
        );

      const clubIds = assignedClubs.map((c) => c.clubId);
      if (clubIds.length > 0 && !rawClubId) {
        conditions.push(inArray(clubMembershipsTable.clubId, clubIds));
      }
    }

    const memberships = await queryBuilder.where(and(...conditions));
    res.json(memberships);
  } catch (err: any) {
    console.error("List club memberships error:", err);
    res.status(500).json({ message: "Failed to list club memberships." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-memberships/:id/parent-approve
 * Parent approves student request. Transitions status: PENDING_PARENT_APPROVAL -> PENDING_ADVISOR_APPROVAL
 */
membershipsRouter.post("/:id/parent-approve", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;
    const roles = req.orgContext!.roles;
    const rawId = req.params.id;
    const membershipId = Array.isArray(rawId) ? rawId[0] : rawId;

    // Verify user is parent and linked to the student in this request
    const [membership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(and(eq(clubMembershipsTable.id, membershipId), eq(clubMembershipsTable.organizationId, orgId)))
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "Membership request not found." });
      return;
    }

    if (membership.status !== "PENDING_PARENT_APPROVAL") {
      res.status(400).json({ message: `Cannot approve request with status: ${membership.status}` });
      return;
    }

    const [parent] = await db
      .select()
      .from(parentsTable)
      .where(and(eq(parentsTable.organizationId, orgId), eq(parentsTable.userId, userId)))
      .limit(1);

    if (!parent && !roles.includes("ADMIN")) {
      res.status(403).json({ message: "Only parents can approve student requests at this stage." });
      return;
    }

    if (parent) {
      const [link] = await db
        .select()
        .from(parentStudentsTable)
        .where(
          and(
            eq(parentStudentsTable.organizationId, orgId),
            eq(parentStudentsTable.parentId, parent.id),
            eq(parentStudentsTable.studentId, membership.studentId)
          )
        )
        .limit(1);

      if (!link && !roles.includes("ADMIN")) {
        res.status(403).json({ message: "You are not authorized to approve requests for this student." });
        return;
      }
    }

    const [updated] = await db
      .update(clubMembershipsTable)
      .set({
        status: "PENDING_ADVISOR_APPROVAL",
        parentApprovedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clubMembershipsTable.id, membershipId))
      .returning();

    res.json({ message: "Parent approval granted.", membership: updated });
  } catch (err: any) {
    console.error("Parent approve error:", err);
    res.status(500).json({ message: "Failed to process parent approval." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-memberships/:id/parent-reject
 * Parent rejects student request. Transitions status: PENDING_PARENT_APPROVAL -> PARENT_REJECTED
 */
membershipsRouter.post("/:id/parent-reject", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;
    const roles = req.orgContext!.roles;
    const rawId = req.params.id;
    const membershipId = Array.isArray(rawId) ? rawId[0] : rawId;

    const [membership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(and(eq(clubMembershipsTable.id, membershipId), eq(clubMembershipsTable.organizationId, orgId)))
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "Membership request not found." });
      return;
    }

    if (membership.status !== "PENDING_PARENT_APPROVAL") {
      res.status(400).json({ message: `Cannot reject request with status: ${membership.status}` });
      return;
    }

    const [parent] = await db
      .select()
      .from(parentsTable)
      .where(and(eq(parentsTable.organizationId, orgId), eq(parentsTable.userId, userId)))
      .limit(1);

    if (!parent && !roles.includes("ADMIN")) {
      res.status(403).json({ message: "Only parents can reject student requests at this stage." });
      return;
    }

    if (parent) {
      const [link] = await db
        .select()
        .from(parentStudentsTable)
        .where(
          and(
            eq(parentStudentsTable.organizationId, orgId),
            eq(parentStudentsTable.parentId, parent.id),
            eq(parentStudentsTable.studentId, membership.studentId)
          )
        )
        .limit(1);

      if (!link && !roles.includes("ADMIN")) {
        res.status(403).json({ message: "You are not authorized to reject requests for this student." });
        return;
      }
    }

    const [updated] = await db
      .update(clubMembershipsTable)
      .set({
        status: "PARENT_REJECTED",
        parentRejectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clubMembershipsTable.id, membershipId))
      .returning();

    res.json({ message: "Membership request rejected by parent.", membership: updated });
  } catch (err: any) {
    console.error("Parent reject error:", err);
    res.status(500).json({ message: "Failed to process parent rejection." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-memberships/:id/advisor-approve
 * Advisor approves parent-approved request. Transitions status: PENDING_ADVISOR_APPROVAL -> ACTIVE
 */
membershipsRouter.post("/:id/advisor-approve", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const roles = req.orgContext!.roles;
    const membershipId = req.orgContext!.membershipId;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [membership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(and(eq(clubMembershipsTable.id, id), eq(clubMembershipsTable.organizationId, orgId)))
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "Membership request not found." });
      return;
    }

    if (membership.status !== "PENDING_ADVISOR_APPROVAL") {
      res.status(400).json({ message: `Cannot approve request with status: ${membership.status}` });
      return;
    }

    if (!roles.includes("ADMIN")) {
      // Check if actor is an assigned advisor to this club
      const [advisor] = await db
        .select()
        .from(clubAdvisorsTable)
        .where(
          and(
            eq(clubAdvisorsTable.clubId, membership.clubId),
            eq(clubAdvisorsTable.organizationMembershipId, membershipId),
            eq(clubAdvisorsTable.status, "ACTIVE")
          )
        )
        .limit(1);

      if (!advisor && !roles.includes("ADVISOR")) {
        res.status(403).json({ message: "Only assigned club advisors or admins can approve this request." });
        return;
      }
    }

    const [updated] = await db
      .update(clubMembershipsTable)
      .set({
        status: "ACTIVE",
        advisorApprovedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clubMembershipsTable.id, id))
      .returning();

    res.json({ message: "Club membership officially approved and active.", membership: updated });
  } catch (err: any) {
    console.error("Advisor approve error:", err);
    res.status(500).json({ message: "Failed to process advisor approval." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-memberships/:id/advisor-reject
 * Advisor rejects request. Transitions status: PENDING_ADVISOR_APPROVAL -> ADVISOR_REJECTED
 */
membershipsRouter.post("/:id/advisor-reject", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const roles = req.orgContext!.roles;
    const membershipId = req.orgContext!.membershipId;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [membership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(and(eq(clubMembershipsTable.id, id), eq(clubMembershipsTable.organizationId, orgId)))
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "Membership request not found." });
      return;
    }

    if (membership.status !== "PENDING_ADVISOR_APPROVAL") {
      res.status(400).json({ message: `Cannot reject request with status: ${membership.status}` });
      return;
    }

    if (!roles.includes("ADMIN")) {
      const [advisor] = await db
        .select()
        .from(clubAdvisorsTable)
        .where(
          and(
            eq(clubAdvisorsTable.clubId, membership.clubId),
            eq(clubAdvisorsTable.organizationMembershipId, membershipId),
            eq(clubAdvisorsTable.status, "ACTIVE")
          )
        )
        .limit(1);

      if (!advisor && !roles.includes("ADVISOR")) {
        res.status(403).json({ message: "Only assigned club advisors or admins can reject this request." });
        return;
      }
    }

    const [updated] = await db
      .update(clubMembershipsTable)
      .set({
        status: "ADVISOR_REJECTED",
        advisorRejectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clubMembershipsTable.id, id))
      .returning();

    res.json({ message: "Club membership request rejected by advisor.", membership: updated });
  } catch (err: any) {
    console.error("Advisor reject error:", err);
    res.status(500).json({ message: "Failed to process advisor rejection." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-memberships/:id/withdraw
 * Student or parent withdraws request/membership. Transitions status -> WITHDRAWN
 */
membershipsRouter.post("/:id/withdraw", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const [membership] = await db
      .select()
      .from(clubMembershipsTable)
      .where(and(eq(clubMembershipsTable.id, id), eq(clubMembershipsTable.organizationId, orgId)))
      .limit(1);

    if (!membership) {
      res.status(404).json({ message: "Membership request not found." });
      return;
    }

    if (membership.status === "WITHDRAWN" || membership.status === "REMOVED") {
      res.status(400).json({ message: `Membership is already ${membership.status}.` });
      return;
    }

    const [updated] = await db
      .update(clubMembershipsTable)
      .set({
        status: "WITHDRAWN",
        withdrawnAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clubMembershipsTable.id, id))
      .returning();

    res.json({ message: "Club membership successfully withdrawn.", membership: updated });
  } catch (err: any) {
    console.error("Withdraw membership error:", err);
    res.status(500).json({ message: "Failed to withdraw membership." });
  }
});

export default membershipsRouter;
