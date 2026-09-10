import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, eq, and } from "@workspace/db";
import {
  usersTable,
  organizationMembershipsTable,
  membershipRolesTable,
  studentsTable,
  parentsTable,
  parentStudentsTable,
  importJobsTable,
} from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const importsRouter = Router({ mergeParams: true });

importsRouter.use(requireAuth);

/**
 * GET /api/organizations/:orgSlug/users/import/:importId
 * Fetches status of an import job
 */
importsRouter.get("/:importId", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawImportId = req.params.importId;
    const importId = Array.isArray(rawImportId) ? rawImportId[0] : rawImportId;

    const [job] = await db
      .select()
      .from(importJobsTable)
      .where(
        and(
          eq(importJobsTable.id, importId),
          eq(importJobsTable.organizationId, orgId)
        )
      )
      .limit(1);

    if (!job) {
      res.status(404).json({ message: "Import job not found" });
      return;
    }

    res.json(job);
  } catch (err: any) {
    console.error("Get import job error:", err);
    res.status(500).json({ message: "Failed to fetch import job." });
  }
});

/**
 * POST /api/organizations/:orgSlug/users/import
 * CSV user roster bulk import endpoint for Administrators
 */
importsRouter.post("/", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const actorMembershipId = req.orgContext!.membershipId;
    const { rows, fileName } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ message: "No CSV rows provided." });
      return;
    }

    // 1. Create Import Job Record
    const [importJob] = await db
      .insert(importJobsTable)
      .values({
        organizationId: orgId,
        createdByMembershipId: actorMembershipId,
        fileName: fileName || "roster_import.csv",
        status: "PROCESSING",
      })
      .returning();

    const defaultPasswordHash = await bcrypt.hash("GuidrPass123!", 10);
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Map parent email -> student IDs to link after creation loop
    const parentLinksToProcess: Array<{ parentEmail: string; studentId: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const fullName = (row.full_name || row.fullName || "").trim();
      const email = (row.email || "").toLowerCase().trim();
      const role = (row.role || "STUDENT").toUpperCase().trim();
      const studentIdentifier = (row.student_identifier || row.studentIdentifier || "").trim();
      const grade = Number(row.grade) || 10;
      const parentEmail = (row.parent_email || row.parentEmail || "").toLowerCase().trim();

      if (!fullName || !email) {
        errors.push(`Row ${i + 1}: Missing name or email`);
        continue;
      }

      try {
        // Find or create User
        let [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (!user) {
          [user] = await db
            .insert(usersTable)
            .values({
              email,
              fullName,
              passwordHash: defaultPasswordHash,
              isActive: true,
            })
            .returning();
          createdCount++;
        } else {
          updatedCount++;
        }

        // Find or create Organization Membership
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

        // Assign Role
        await db
          .insert(membershipRolesTable)
          .values({
            organizationMembershipId: membership.id,
            roleId: ["ADMIN", "ADVISOR", "STUDENT", "PARENT"].includes(role) ? role : "STUDENT",
          })
          .onConflictDoNothing();

        // Specific profiles
        if (role === "STUDENT") {
          const stuId = studentIdentifier || `STU-${Date.now().toString().slice(-4)}-${i}`;
          let [student] = await db
            .select()
            .from(studentsTable)
            .where(
              and(
                eq(studentsTable.organizationId, orgId),
                eq(studentsTable.studentIdentifier, stuId)
              )
            )
            .limit(1);

          if (!student) {
            [student] = await db
              .insert(studentsTable)
              .values({
                organizationId: orgId,
                userId: user.id,
                studentIdentifier: stuId,
                grade,
                status: "active",
              })
              .returning();
          }

          if (parentEmail) {
            parentLinksToProcess.push({ parentEmail, studentId: student.id });
          }
        } else if (role === "PARENT") {
          const [parent] = await db
            .select()
            .from(parentsTable)
            .where(
              and(
                eq(parentsTable.organizationId, orgId),
                eq(parentsTable.userId, user.id)
              )
            )
            .limit(1);

          if (!parent) {
            await db.insert(parentsTable).values({
              organizationId: orgId,
              userId: user.id,
            });
          }
        }
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${email}): ${err.message}`);
      }
    }

    // Process Parent-Student Links
    for (const link of parentLinksToProcess) {
      const [parentUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, link.parentEmail))
        .limit(1);

      if (parentUser) {
        const [parent] = await db
          .select()
          .from(parentsTable)
          .where(
            and(
              eq(parentsTable.organizationId, orgId),
              eq(parentsTable.userId, parentUser.id)
            )
          )
          .limit(1);

        if (parent) {
          await db
            .insert(parentStudentsTable)
            .values({
              organizationId: orgId,
              parentId: parent.id,
              studentId: link.studentId,
              relationshipType: "Parent",
            })
            .onConflictDoNothing();
        }
      }
    }

    const summaryText = `Processed ${rows.length} rows. ${createdCount} created, ${updatedCount} updated. ${errors.length} errors.`;

    await db
      .update(importJobsTable)
      .set({
        status: "COMPLETED",
        summary: summaryText,
        completedAt: new Date(),
      })
      .where(eq(importJobsTable.id, importJob.id));

    res.json({
      jobId: importJob.id,
      summary: summaryText,
      createdCount,
      updatedCount,
      errors,
    });
  } catch (err: any) {
    console.error("CSV import error:", err);
    res.status(500).json({ message: "Failed to process roster import." });
  }
});

export default importsRouter;
