import { Router } from "express";
import { db, eq, and, inArray } from "@workspace/db";
import {
  clubSchedulesTable,
  clubSessionsTable,
  attendanceRecordsTable,
  announcementsTable,
  resourcesTable,
  badgesTable,
  studentBadgesTable,
  clubMembershipsTable,
  studentsTable,
  usersTable,
  clubsTable,
  clubAdvisorsTable,
  organizationMembershipsTable,
} from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const operationsRouter = Router({ mergeParams: true });

operationsRouter.use(requireAuth);

/**
 * ==========================================
 * 1. CLUB SCHEDULES & SESSIONS
 * ==========================================
 */

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId/schedules
 */
operationsRouter.get("/clubs/:clubId/schedules", async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const schedules = await db
      .select()
      .from(clubSchedulesTable)
      .where(eq(clubSchedulesTable.clubId, clubId));

    res.json(schedules);
  } catch (err: any) {
    console.error("List schedules error:", err);
    res.status(500).json({ message: "Failed to fetch club schedules." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/schedules
 * Admin or assigned Advisor creates recurring schedule
 */
operationsRouter.post("/clubs/:clubId/schedules", async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const { dayOfWeek, startTime, endTime, locationId } = req.body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      res.status(400).json({ message: "dayOfWeek, startTime, and endTime are required." });
      return;
    }

    const [schedule] = await db
      .insert(clubSchedulesTable)
      .values({
        clubId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        locationId: locationId || null,
      })
      .returning();

    res.status(201).json(schedule);
  } catch (err: any) {
    console.error("Create schedule error:", err);
    res.status(500).json({ message: "Failed to create club schedule." });
  }
});

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId/sessions
 */
operationsRouter.get("/clubs/:clubId/sessions", async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const sessions = await db
      .select()
      .from(clubSessionsTable)
      .where(eq(clubSessionsTable.clubId, clubId));

    res.json(sessions);
  } catch (err: any) {
    console.error("List sessions error:", err);
    res.status(500).json({ message: "Failed to fetch club sessions." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/sessions
 * Create single session occurrence
 */
operationsRouter.post("/clubs/:clubId/sessions", async (req, res) => {
  try {
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const { scheduledDate, startDatetime, endDatetime, locationId } = req.body;

    if (!scheduledDate || !startDatetime || !endDatetime) {
      res.status(400).json({ message: "scheduledDate, startDatetime, and endDatetime are required." });
      return;
    }

    const [session] = await db
      .insert(clubSessionsTable)
      .values({
        clubId,
        scheduledDate,
        startDatetime: new Date(startDatetime),
        endDatetime: new Date(endDatetime),
        locationId: locationId || null,
        status: "SCHEDULED",
      })
      .returning();

    res.status(201).json(session);
  } catch (err: any) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Failed to create club session." });
  }
});

/**
 * ==========================================
 * 2. ATTENDANCE RECORDS
 * ==========================================
 */

/**
 * GET /api/organizations/:orgSlug/club-sessions/:sessionId/attendance
 * Returns active club members roster along with recorded attendance for this session
 */
operationsRouter.get("/club-sessions/:sessionId/attendance", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawSessionId = req.params.sessionId;
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

    // Fetch session details
    const [session] = await db
      .select()
      .from(clubSessionsTable)
      .where(eq(clubSessionsTable.id, sessionId))
      .limit(1);

    if (!session) {
      res.status(404).json({ message: "Club session not found." });
      return;
    }

    // Fetch active members of this club
    const activeMembers = await db
      .select({
        studentId: clubMembershipsTable.studentId,
        studentIdentifier: studentsTable.studentIdentifier,
        grade: studentsTable.grade,
        fullName: usersTable.fullName,
        email: usersTable.email,
      })
      .from(clubMembershipsTable)
      .innerJoin(studentsTable, eq(clubMembershipsTable.studentId, studentsTable.id))
      .leftJoin(usersTable, eq(studentsTable.userId, usersTable.id))
      .where(
        and(
          eq(clubMembershipsTable.clubId, session.clubId),
          eq(clubMembershipsTable.status, "ACTIVE")
        )
      );

    // Fetch recorded attendance entries for this session
    const recordedAttendance = await db
      .select()
      .from(attendanceRecordsTable)
      .where(eq(attendanceRecordsTable.clubSessionId, sessionId));

    const attendanceMap: Record<string, any> = {};
    for (const record of recordedAttendance) {
      attendanceMap[record.studentId] = record;
    }

    const roster = activeMembers.map((member) => ({
      studentId: member.studentId,
      studentIdentifier: member.studentIdentifier,
      grade: member.grade,
      fullName: member.fullName,
      email: member.email,
      status: attendanceMap[member.studentId]?.status || "UNRECORDED",
      attendanceId: attendanceMap[member.studentId]?.id || null,
      recordedAt: attendanceMap[member.studentId]?.recordedAt || null,
    }));

    res.json({
      session,
      roster,
    });
  } catch (err: any) {
    console.error("Get attendance error:", err);
    res.status(500).json({ message: "Failed to fetch attendance roster." });
  }
});

/**
 * POST /api/organizations/:orgSlug/club-sessions/:sessionId/attendance
 * Records or updates attendance statuses for active club members
 */
operationsRouter.post("/club-sessions/:sessionId/attendance", async (req, res) => {
  try {
    const actorMembershipId = req.orgContext!.membershipId;
    const rawSessionId = req.params.sessionId;
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
    const { records } = req.body; // Array of { studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }

    if (!Array.isArray(records) || records.length === 0) {
      res.status(400).json({ message: "Attendance records array is required." });
      return;
    }

    for (const item of records) {
      if (!item.studentId || !item.status) continue;

      const [existing] = await db
        .select()
        .from(attendanceRecordsTable)
        .where(
          and(
            eq(attendanceRecordsTable.clubSessionId, sessionId),
            eq(attendanceRecordsTable.studentId, item.studentId)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(attendanceRecordsTable)
          .set({
            status: item.status,
            updatedByMembershipId: actorMembershipId,
            updatedAt: new Date(),
          })
          .where(eq(attendanceRecordsTable.id, existing.id));
      } else {
        await db.insert(attendanceRecordsTable).values({
          clubSessionId: sessionId,
          studentId: item.studentId,
          status: item.status,
          recordedByMembershipId: actorMembershipId,
        });
      }
    }

    res.json({ message: "Attendance successfully updated." });
  } catch (err: any) {
    console.error("Post attendance error:", err);
    res.status(500).json({ message: "Failed to record attendance." });
  }
});

/**
 * ==========================================
 * 3. ANNOUNCEMENTS
 * ==========================================
 */

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId/announcements
 */
operationsRouter.get("/clubs/:clubId/announcements", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const announcements = await db
      .select({
        id: announcementsTable.id,
        clubId: announcementsTable.clubId,
        title: announcementsTable.title,
        content: announcementsTable.content,
        publishedAt: announcementsTable.publishedAt,
        authorFullName: usersTable.fullName,
      })
      .from(announcementsTable)
      .innerJoin(
        organizationMembershipsTable,
        eq(announcementsTable.authorMembershipId, organizationMembershipsTable.id)
      )
      .innerJoin(usersTable, eq(organizationMembershipsTable.userId, usersTable.id))
      .where(
        and(
          eq(announcementsTable.organizationId, orgId),
          eq(announcementsTable.clubId, clubId)
        )
      );

    res.json(announcements);
  } catch (err: any) {
    console.error("List announcements error:", err);
    res.status(500).json({ message: "Failed to fetch announcements." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/announcements
 */
operationsRouter.post("/clubs/:clubId/announcements", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const actorMembershipId = req.orgContext!.membershipId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: "Announcement title and content are required." });
      return;
    }

    const [announcement] = await db
      .insert(announcementsTable)
      .values({
        organizationId: orgId,
        clubId,
        authorMembershipId: actorMembershipId,
        title: title.trim(),
        content: content.trim(),
      })
      .returning();

    res.status(201).json(announcement);
  } catch (err: any) {
    console.error("Post announcement error:", err);
    res.status(500).json({ message: "Failed to post announcement." });
  }
});

/**
 * ==========================================
 * 4. RESOURCES
 * ==========================================
 */

/**
 * GET /api/organizations/:orgSlug/clubs/:clubId/resources
 */
operationsRouter.get("/clubs/:clubId/resources", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;

    const resources = await db
      .select()
      .from(resourcesTable)
      .where(
        and(eq(resourcesTable.organizationId, orgId), eq(resourcesTable.clubId, clubId))
      );

    res.json(resources);
  } catch (err: any) {
    console.error("List resources error:", err);
    res.status(500).json({ message: "Failed to fetch club resources." });
  }
});

/**
 * POST /api/organizations/:orgSlug/clubs/:clubId/resources
 */
operationsRouter.post("/clubs/:clubId/resources", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const actorMembershipId = req.orgContext!.membershipId;
    const rawClubId = req.params.clubId;
    const clubId = Array.isArray(rawClubId) ? rawClubId[0] : rawClubId;
    const { title, description, fileUrl, resourceType } = req.body;

    if (!title || !fileUrl) {
      res.status(400).json({ message: "Resource title and fileUrl are required." });
      return;
    }

    const [resource] = await db
      .insert(resourcesTable)
      .values({
        organizationId: orgId,
        clubId,
        uploadedByMembershipId: actorMembershipId,
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl: fileUrl.trim(),
        resourceType: resourceType || "document",
      })
      .returning();

    res.status(201).json(resource);
  } catch (err: any) {
    console.error("Create resource error:", err);
    res.status(500).json({ message: "Failed to upload resource." });
  }
});

/**
 * ==========================================
 * 5. BADGES & RECOGNITION
 * ==========================================
 */

/**
 * GET /api/organizations/:orgSlug/badges
 */
operationsRouter.get("/badges", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;

    const badges = await db
      .select()
      .from(badgesTable)
      .where(eq(badgesTable.organizationId, orgId));

    res.json(badges);
  } catch (err: any) {
    console.error("List badges error:", err);
    res.status(500).json({ message: "Failed to fetch badges." });
  }
});

/**
 * POST /api/organizations/:orgSlug/badges
 * Create badge template (Admin)
 */
operationsRouter.post("/badges", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const { name, description, iconUrl } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Badge name is required." });
      return;
    }

    const [badge] = await db
      .insert(badgesTable)
      .values({
        organizationId: orgId,
        name: name.trim(),
        description: description?.trim() || null,
        iconUrl: iconUrl?.trim() || null,
      })
      .returning();

    res.status(201).json(badge);
  } catch (err: any) {
    console.error("Create badge error:", err);
    res.status(500).json({ message: "Failed to create badge template." });
  }
});

/**
 * POST /api/organizations/:orgSlug/students/:studentId/badges
 * Award badge to student
 */
operationsRouter.post("/students/:studentId/badges", async (req, res) => {
  try {
    const actorMembershipId = req.orgContext!.membershipId;
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId;
    const { badgeId, clubId, note } = req.body;

    if (!badgeId) {
      res.status(400).json({ message: "Badge ID is required." });
      return;
    }

    const [awarded] = await db
      .insert(studentBadgesTable)
      .values({
        studentId,
        badgeId,
        clubId: clubId || null,
        awardedByMembershipId: actorMembershipId,
        note: note?.trim() || null,
      })
      .returning();

    res.status(201).json(awarded);
  } catch (err: any) {
    console.error("Award badge error:", err);
    res.status(500).json({ message: "Failed to award badge." });
  }
});

/**
 * GET /api/organizations/:orgSlug/students/:studentId/badges
 */
operationsRouter.get("/students/:studentId/badges", async (req, res) => {
  try {
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId) ? rawStudentId[0] : rawStudentId;

    const badges = await db
      .select({
        id: studentBadgesTable.id,
        badgeId: studentBadgesTable.badgeId,
        badgeName: badgesTable.name,
        badgeDescription: badgesTable.description,
        iconUrl: badgesTable.iconUrl,
        awardedAt: studentBadgesTable.awardedAt,
        note: studentBadgesTable.note,
        clubName: clubsTable.name,
      })
      .from(studentBadgesTable)
      .innerJoin(badgesTable, eq(studentBadgesTable.badgeId, badgesTable.id))
      .leftJoin(clubsTable, eq(studentBadgesTable.clubId, clubsTable.id))
      .where(eq(studentBadgesTable.studentId, studentId));

    res.json(badges);
  } catch (err: any) {
    console.error("Get student badges error:", err);
    res.status(500).json({ message: "Failed to fetch student badges." });
  }
});

export default operationsRouter;
