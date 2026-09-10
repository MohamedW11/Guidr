import { Router } from "express";
import { db, eq, and, sql } from "@workspace/db";
import {
  clubsTable,
  locationsTable,
  clubAdvisorsTable,
  organizationMembershipsTable,
  usersTable,
  studentsTable,
} from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const clubsRouter = Router({ mergeParams: true });

clubsRouter.use(requireAuth);

/**
 * GET /api/organizations/:orgSlug/clubs/explore
 * Student discovery feed: returns ACTIVE clubs filtered by student grade eligibility
 */
clubsRouter.get("/explore", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const userId = req.user!.id;

    // Fetch student grade if user is a student
    const [student] = await db
      .select()
      .from(studentsTable)
      .where(
        and(
          eq(studentsTable.organizationId, orgId),
          eq(studentsTable.userId, userId)
        )
      )
      .limit(1);

    const studentGrade = student ? student.grade : null;

    // Fetch active clubs in this organization
    const clubs = await db
      .select({
        id: clubsTable.id,
        name: clubsTable.name,
        description: clubsTable.description,
        minimumGrade: clubsTable.minimumGrade,
        maximumGrade: clubsTable.maximumGrade,
        status: clubsTable.status,
        startDate: clubsTable.startDate,
        endDate: clubsTable.endDate,
        locationId: clubsTable.locationId,
        locationName: locationsTable.name,
      })
      .from(clubsTable)
      .leftJoin(locationsTable, eq(clubsTable.locationId, locationsTable.id))
      .where(
        and(
          eq(clubsTable.organizationId, orgId),
          eq(clubsTable.status, "ACTIVE")
        )
      );

    // Annotate eligibility for student
    const eligibleClubs = clubs.map((club) => {
      const isEligible = studentGrade
        ? studentGrade >= club.minimumGrade && studentGrade <= club.maximumGrade
        : true;
      return {
        ...club,
        isEligible,
        studentGrade,
      };
    });

    res.json(eligibleClubs);
  } catch (err: any) {
    console.error("Explore clubs error:", err);
    res.status(500).json({ message: "Failed to load club discovery feed." });
  }
});

/**
 * GET /api/organizations/:orgSlug/clubs
 * Catalog list for Admins & Advisors
 */
clubsRouter.get("/", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;

    const clubs = await db
      .select({
        id: clubsTable.id,
        name: clubsTable.name,
        description: clubsTable.description,
        minimumGrade: clubsTable.minimumGrade,
        maximumGrade: clubsTable.maximumGrade,
        status: clubsTable.status,
        startDate: clubsTable.startDate,
        endDate: clubsTable.endDate,
        locationId: clubsTable.locationId,
        locationName: locationsTable.name,
        createdAt: clubsTable.createdAt,
      })
      .from(clubsTable)
      .leftJoin(locationsTable, eq(clubsTable.locationId, locationsTable.id))
      .where(eq(clubsTable.organizationId, orgId));

    res.json(clubs);
  } catch (err: any) {
    console.error("List clubs error:", err);
    res.status(500).json({ message: "Failed to load clubs catalog." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs
 * Create club (Admin required)
 */
clubsRouter.post("/", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const membershipId = req.orgContext!.membershipId;
    const { name, description, minimumGrade, maximumGrade, locationId } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Club name is required." });
      return;
    }

    const minG = Number(minimumGrade) || 9;
    const maxG = Number(maximumGrade) || 12;

    if (minG > maxG) {
      res.status(400).json({ message: "Minimum grade cannot be greater than maximum grade." });
      return;
    }

    const [club] = await db
      .insert(clubsTable)
      .values({
        organizationId: orgId,
        name: name.trim(),
        description: description?.trim() || null,
        minimumGrade: minG,
        maximumGrade: maxG,
        locationId: locationId || null,
        status: "DRAFT",
        createdByMembershipId: membershipId,
      })
      .returning();

    res.status(201).json(club);
  } catch (err: any) {
    console.error("Create club error:", err);
    res.status(500).json({ message: "Failed to create club." });
  }
});

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId
 * Fetches single club workspace info
 */
clubsRouter.get("/:clubId", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const [club] = await db
      .select({
        id: clubsTable.id,
        name: clubsTable.name,
        description: clubsTable.description,
        minimumGrade: clubsTable.minimumGrade,
        maximumGrade: clubsTable.maximumGrade,
        status: clubsTable.status,
        startDate: clubsTable.startDate,
        endDate: clubsTable.endDate,
        locationId: clubsTable.locationId,
        locationName: locationsTable.name,
      })
      .from(clubsTable)
      .leftJoin(locationsTable, eq(clubsTable.locationId, locationsTable.id))
      .where(and(eq(clubsTable.id, clubId), eq(clubsTable.organizationId, orgId)))
      .limit(1);

    if (!club) {
      res.status(404).json({ message: "Club not found." });
      return;
    }

    // Fetch assigned advisors
    const advisors = await db
      .select({
        membershipId: clubAdvisorsTable.organizationMembershipId,
        fullName: usersTable.fullName,
        email: usersTable.email,
        assignedAt: clubAdvisorsTable.assignedAt,
      })
      .from(clubAdvisorsTable)
      .innerJoin(
        organizationMembershipsTable,
        eq(clubAdvisorsTable.organizationMembershipId, organizationMembershipsTable.id)
      )
      .innerJoin(usersTable, eq(organizationMembershipsTable.userId, usersTable.id))
      .where(and(eq(clubAdvisorsTable.clubId, clubId), eq(clubAdvisorsTable.status, "ACTIVE")));

    res.json({
      ...club,
      advisors,
    });
  } catch (err: any) {
    console.error("Get club error:", err);
    res.status(500).json({ message: "Failed to fetch club workspace." });
  }
});

/**
 * PATCH /api/organizations/:orgSlug/clubs/:clubId
 * Updates club details (Admin or assigned Advisor)
 */
clubsRouter.patch("/:clubId", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const { name, description, minimumGrade, maximumGrade, locationId } = req.body;

    const [club] = await db
      .select()
      .from(clubsTable)
      .where(and(eq(clubsTable.id, clubId), eq(clubsTable.organizationId, orgId)))
      .limit(1);

    if (!club) {
      res.status(404).json({ message: "Club not found." });
      return;
    }

    await db
      .update(clubsTable)
      .set({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(minimumGrade !== undefined && { minimumGrade: Number(minimumGrade) }),
        ...(maximumGrade !== undefined && { maximumGrade: Number(maximumGrade) }),
        ...(locationId !== undefined && { locationId: locationId || null }),
        updatedAt: new Date(),
      })
      .where(eq(clubsTable.id, clubId));

    res.json({ message: "Club details updated successfully." });
  } catch (err: any) {
    console.error("Update club error:", err);
    res.status(500).json({ message: "Failed to update club." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/publish
 * Transition club status: DRAFT -> ACTIVE
 */
clubsRouter.post("/:clubId/publish", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    await db
      .update(clubsTable)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(and(eq(clubsTable.id, clubId), eq(clubsTable.organizationId, orgId)));

    res.json({ message: "Club successfully published to ACTIVE status." });
  } catch (err: any) {
    console.error("Publish club error:", err);
    res.status(500).json({ message: "Failed to publish club." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/archive
 * Transition club status: ACTIVE -> ARCHIVED
 */
clubsRouter.post("/:clubId/archive", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    await db
      .update(clubsTable)
      .set({ status: "ARCHIVED", updatedAt: new Date() })
      .where(and(eq(clubsTable.id, clubId), eq(clubsTable.organizationId, orgId)));

    res.json({ message: "Club successfully archived." });
  } catch (err: any) {
    console.error("Archive club error:", err);
    res.status(500).json({ message: "Failed to archive club." });
  }
});

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId/advisors
 */
clubsRouter.get("/:clubId/advisors", async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const advisors = await db
      .select({
        membershipId: clubAdvisorsTable.organizationMembershipId,
        fullName: usersTable.fullName,
        email: usersTable.email,
        assignedAt: clubAdvisorsTable.assignedAt,
      })
      .from(clubAdvisorsTable)
      .innerJoin(
        organizationMembershipsTable,
        eq(clubAdvisorsTable.organizationMembershipId, organizationMembershipsTable.id)
      )
      .innerJoin(usersTable, eq(organizationMembershipsTable.userId, usersTable.id))
      .where(and(eq(clubAdvisorsTable.clubId, clubId), eq(clubAdvisorsTable.status, "ACTIVE")));

    res.json(advisors);
  } catch (err: any) {
    console.error("List advisors error:", err);
    res.status(500).json({ message: "Failed to load advisors." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/advisors
 * Assigns an advisor to a club (Admin required)
 */
clubsRouter.post("/:clubId/advisors", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const actorMemId = req.orgContext!.membershipId;
    const { membershipId } = req.body;

    if (!membershipId) {
      res.status(400).json({ message: "Membership ID is required." });
      return;
    }

    await db
      .insert(clubAdvisorsTable)
      .values({
        clubId,
        organizationMembershipId: membershipId,
        assignedByMembershipId: actorMemId,
        status: "ACTIVE",
      })
      .onConflictDoNothing();

    res.status(201).json({ message: "Advisor successfully assigned to club." });
  } catch (err: any) {
    console.error("Assign advisor error:", err);
    res.status(500).json({ message: "Failed to assign advisor." });
  }
});

/**
 * DELETE /api/organizations/:orgSlug/clubs/:clubId/advisors/:membershipId
 * Unassigns an advisor from a club
 */
clubsRouter.delete("/:clubId/advisors/:membershipId", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const rawMemId = req.params.membershipId;
    const membershipId = Array.isArray(rawMemId) ? rawMemId[0] : rawMemId;

    await db
      .delete(clubAdvisorsTable)
      .where(
        and(
          eq(clubAdvisorsTable.clubId, clubId),
          eq(clubAdvisorsTable.organizationMembershipId, membershipId)
        )
      );

    res.json({ message: "Advisor assignment removed." });
  } catch (err: any) {
    console.error("Remove advisor error:", err);
    res.status(500).json({ message: "Failed to remove advisor." });
  }
});

export default clubsRouter;
