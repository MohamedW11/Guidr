import { Router } from "express";
import { db, eq, and } from "@workspace/db";
import {
  usersTable,
  studentsTable,
  parentsTable,
  parentStudentsTable,
} from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const childrenRouter = Router({ mergeParams: true });

childrenRouter.use(requireAuth);

/**
 * GET /api/organizations/:orgSlug/my-children
 * Returns list of linked children for the authenticated Parent user
 */
childrenRouter.get("/my-children", requireOrganizationRole("PARENT"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;

    // Find Parent entity for this user in organization
    const [parent] = await db
      .select()
      .from(parentsTable)
      .where(
        and(
          eq(parentsTable.organizationId, orgId),
          eq(parentsTable.userId, userId)
        )
      )
      .limit(1);

    if (!parent) {
      res.json([]);
      return;
    }

    // Fetch linked children
    const links = await db
      .select({
        studentId: studentsTable.id,
        studentUserId: studentsTable.userId,
        studentIdentifier: studentsTable.studentIdentifier,
        grade: studentsTable.grade,
        relationshipType: parentStudentsTable.relationshipType,
      })
      .from(parentStudentsTable)
      .innerJoin(studentsTable, eq(parentStudentsTable.studentId, studentsTable.id))
      .where(
        and(
          eq(parentStudentsTable.organizationId, orgId),
          eq(parentStudentsTable.parentId, parent.id)
        )
      );

    const children: any[] = [];
    for (const link of links) {
      let fullName = "Student";
      let email = "";
      if (link.studentUserId) {
        const [u] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, link.studentUserId))
          .limit(1);
        if (u) {
          fullName = u.fullName;
          email = u.email;
        }
      }

      children.push({
        id: link.studentId,
        studentUserId: link.studentUserId,
        studentIdentifier: link.studentIdentifier,
        grade: link.grade,
        relationshipType: link.relationshipType,
        fullName,
        email,
      });
    }

    res.json(children);
  } catch (err: any) {
    console.error("List parent children error:", err);
    res.status(500).json({ message: "Failed to load linked children." });
  }
});

/**
 * GET /api/organizations/:orgSlug/children/:studentId
 * Fetches details of a specific linked child after verifying parent authorization
 */
childrenRouter.get("/children/:studentId", requireOrganizationRole("PARENT"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId;

    // Verify parent identity & link
    const [parent] = await db
      .select()
      .from(parentsTable)
      .where(
        and(
          eq(parentsTable.organizationId, orgId),
          eq(parentsTable.userId, userId)
        )
      )
      .limit(1);

    if (!parent) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const [link] = await db
      .select()
      .from(parentStudentsTable)
      .where(
        and(
          eq(parentStudentsTable.organizationId, orgId),
          eq(parentStudentsTable.parentId, parent.id),
          eq(parentStudentsTable.studentId, studentId)
        )
      )
      .limit(1);

    if (!link) {
      res.status(403).json({ message: "Access denied. Student is not linked to your parent account." });
      return;
    }

    const [student] = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.id, studentId))
      .limit(1);

    if (!student) {
      res.status(404).json({ message: "Student record not found" });
      return;
    }

    let studentUser = null;
    if (student.userId) {
      const [u] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, student.userId))
        .limit(1);
      if (u) {
        studentUser = { id: u.id, fullName: u.fullName, email: u.email, phone: u.phone };
      }
    }

    res.json({
      studentId: student.id,
      studentIdentifier: student.studentIdentifier,
      grade: student.grade,
      relationshipType: link.relationshipType,
      user: studentUser,
    });
  } catch (err: any) {
    console.error("Get child detail error:", err);
    res.status(500).json({ message: "Failed to fetch child details." });
  }
});

export default childrenRouter;
