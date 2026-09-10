import { db, eq, and } from "@workspace/db";
import {
  usersTable,
  organizationsTable,
  organizationMembershipsTable,
  rolesTable,
  membershipRolesTable,
  studentsTable,
  parentsTable,
  parentStudentsTable,
  locationsTable,
  clubsTable,
  clubAdvisorsTable,
  clubMembershipsTable,
  clubSchedulesTable,
  clubSessionsTable,
  announcementsTable,
  badgesTable,
} from "@workspace/db/schema";
import bcrypt from "bcryptjs";

export async function seedMain() {
  console.log("🌱 Starting Guidr V1 Phase 5 database seed...");

  // 1. Seed Roles
  const roles = [
    { id: "ADMIN", name: "School Administrator" },
    { id: "ADVISOR", name: "Club Advisor" },
    { id: "STUDENT", name: "Student" },
    { id: "PARENT", name: "Parent" },
  ];

  for (const role of roles) {
    await db
      .insert(rolesTable)
      .values(role)
      .onConflictDoUpdate({ target: rolesTable.id, set: { name: role.name } });
  }
  console.log("✅ Roles seeded: ADMIN, ADVISOR, STUDENT, PARENT");

  // 2. Seed 1 Test Organization (Cairo International School)
  const [org] = await db
    .insert(organizationsTable)
    .values({
      name: "Cairo International School",
      slug: "cairo-international-school",
      logoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: organizationsTable.slug,
      set: { name: "Cairo International School" },
    })
    .returning();

  console.log(`✅ Organization seeded: ${org.name} (${org.slug})`);

  // Shared password hashes for test accounts
  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const advisorPasswordHash = await bcrypt.hash("AdvisorPass123!", 10);
  const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);
  const parentPasswordHash = await bcrypt.hash("ParentPass123!", 10);

  // 3. Seed Demo Users & Memberships
  const demoUsers = [
    {
      email: "admin@guidred.org",
      fullName: "Dr. Laila Hassan",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    {
      email: "advisor@guidred.org",
      fullName: "Mr. Tarek Salem",
      passwordHash: advisorPasswordHash,
      role: "ADVISOR",
    },
    {
      email: "student@guidred.org",
      fullName: "Youssef Ahmed",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      studentIdentifier: "STU-2026-001",
      grade: 10,
    },
    {
      email: "nour.student@guidred.org",
      fullName: "Nour Ahmed",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      studentIdentifier: "STU-2026-002",
      grade: 11,
    },
    {
      email: "parent@guidred.org",
      fullName: "Mariam Ahmed",
      passwordHash: parentPasswordHash,
      role: "PARENT",
    },
  ];

  let adminMemId: string | null = null;
  let advisorMemId: string | null = null;
  let parentEntityId: string | null = null;
  let youssefStudentEntityId: string | null = null;
  const createdStudents: Array<{ id: string; fullName: string }> = [];

  for (const userDef of demoUsers) {
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userDef.email))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(usersTable)
        .values({
          email: userDef.email,
          fullName: userDef.fullName,
          passwordHash: userDef.passwordHash,
          isActive: true,
        })
        .returning();
    }

    const userMemberships = await db
      .select()
      .from(organizationMembershipsTable)
      .where(eq(organizationMembershipsTable.userId, user.id));

    let orgMem = userMemberships.find((m) => m.organizationId === org.id);
    if (!orgMem) {
      [orgMem] = await db
        .insert(organizationMembershipsTable)
        .values({
          organizationId: org.id,
          userId: user.id,
          status: "active",
        })
        .returning();
    }

    if (userDef.role === "ADMIN") adminMemId = orgMem.id;
    if (userDef.role === "ADVISOR") advisorMemId = orgMem.id;

    await db
      .insert(membershipRolesTable)
      .values({
        organizationMembershipId: orgMem.id,
        roleId: userDef.role,
      })
      .onConflictDoNothing();

    if (userDef.role === "STUDENT" && userDef.studentIdentifier) {
      let [student] = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.studentIdentifier, userDef.studentIdentifier))
        .limit(1);

      if (!student) {
        [student] = await db
          .insert(studentsTable)
          .values({
            organizationId: org.id,
            userId: user.id,
            studentIdentifier: userDef.studentIdentifier,
            grade: userDef.grade || 10,
            status: "active",
          })
          .returning();
      }
      if (userDef.email === "student@guidred.org") {
        youssefStudentEntityId = student.id;
      }
      createdStudents.push({ id: student.id, fullName: user.fullName });
    } else if (userDef.role === "PARENT") {
      let [parent] = await db
        .select()
        .from(parentsTable)
        .where(eq(parentsTable.userId, user.id))
        .limit(1);

      if (!parent) {
        [parent] = await db
          .insert(parentsTable)
          .values({
            organizationId: org.id,
            userId: user.id,
          })
          .returning();
      }
      parentEntityId = parent.id;
    }

    console.log(`👤 Seeded User: ${user.fullName} (${userDef.email}) ➔ Role: ${userDef.role}`);
  }

  // Link Parent Mariam Ahmed to children
  if (parentEntityId && createdStudents.length > 0) {
    for (const student of createdStudents) {
      await db
        .insert(parentStudentsTable)
        .values({
          organizationId: org.id,
          parentId: parentEntityId,
          studentId: student.id,
          relationshipType: "Mother",
        })
        .onConflictDoNothing();
    }
  }

  // 4. Seed Locations
  let [labLocation] = await db
    .select()
    .from(locationsTable)
    .where(and(eq(locationsTable.organizationId, org.id), eq(locationsTable.name, "Robotics Lab 2")))
    .limit(1);

  if (!labLocation) {
    [labLocation] = await db
      .insert(locationsTable)
      .values({
        organizationId: org.id,
        name: "Robotics Lab 2",
        description: "STEM Building 2nd Floor",
      })
      .returning();
  }

  let [auditoriumLocation] = await db
    .select()
    .from(locationsTable)
    .where(and(eq(locationsTable.organizationId, org.id), eq(locationsTable.name, "Main Auditorium")))
    .limit(1);

  if (!auditoriumLocation) {
    [auditoriumLocation] = await db
      .insert(locationsTable)
      .values({
        organizationId: org.id,
        name: "Main Auditorium",
        description: "Main Campus Arts Center",
      })
      .returning();
  }

  // 5. Seed Clubs
  let [roboticsClub] = await db
    .select()
    .from(clubsTable)
    .where(and(eq(clubsTable.organizationId, org.id), eq(clubsTable.name, "Robotics & AI Club")))
    .limit(1);

  if (!roboticsClub) {
    [roboticsClub] = await db
      .insert(clubsTable)
      .values({
        organizationId: org.id,
        name: "Robotics & AI Club",
        description: "Design, build, and program autonomous competitive robots for international STEM challenges.",
        minimumGrade: 9,
        maximumGrade: 12,
        locationId: labLocation.id,
        status: "ACTIVE",
        createdByMembershipId: adminMemId,
      })
      .returning();
  }

  let [debateClub] = await db
    .select()
    .from(clubsTable)
    .where(and(eq(clubsTable.organizationId, org.id), eq(clubsTable.name, "Debate & Public Speaking Society")))
    .limit(1);

  if (!debateClub) {
    [debateClub] = await db
      .insert(clubsTable)
      .values({
        organizationId: org.id,
        name: "Debate & Public Speaking Society",
        description: "Develop persuasive communication, critical analysis, and parliamentary debate skills.",
        minimumGrade: 10,
        maximumGrade: 12,
        locationId: auditoriumLocation.id,
        status: "ACTIVE",
        createdByMembershipId: adminMemId,
      })
      .returning();
  }

  // Assign Advisor Mr. Tarek Salem to Robotics & AI Club
  if (advisorMemId && roboticsClub) {
    await db
      .insert(clubAdvisorsTable)
      .values({
        clubId: roboticsClub.id,
        organizationMembershipId: advisorMemId,
        assignedByMembershipId: adminMemId,
        status: "ACTIVE",
      })
      .onConflictDoNothing();
  }

  // 6. Seed Sample Join Request & Active Membership
  if (youssefStudentEntityId && roboticsClub) {
    let [existingReq] = await db
      .select()
      .from(clubMembershipsTable)
      .where(
        and(
          eq(clubMembershipsTable.clubId, roboticsClub.id),
          eq(clubMembershipsTable.studentId, youssefStudentEntityId)
        )
      )
      .limit(1);

    if (!existingReq) {
      await db.insert(clubMembershipsTable).values({
        organizationId: org.id,
        clubId: roboticsClub.id,
        studentId: youssefStudentEntityId,
        status: "PENDING_PARENT_APPROVAL",
      });
      console.log("📝 Seeded Join Request: Youssef Ahmed ➔ Robotics & AI Club (PENDING_PARENT_APPROVAL)");
    }
  }

  // 7. Seed Operational Data (Schedule, Session, Announcement, Badge)
  if (roboticsClub && labLocation && advisorMemId) {
    // Schedule
    const [existingSchedule] = await db
      .select()
      .from(clubSchedulesTable)
      .where(eq(clubSchedulesTable.clubId, roboticsClub.id))
      .limit(1);

    if (!existingSchedule) {
      await db.insert(clubSchedulesTable).values({
        clubId: roboticsClub.id,
        dayOfWeek: 3, // Wednesday
        startTime: "15:00",
        endTime: "16:30",
        locationId: labLocation.id,
      });
      console.log("📅 Seeded Schedule: Wednesdays 15:00–16:30 @ Robotics Lab 2");
    }

    // Session
    const [existingSession] = await db
      .select()
      .from(clubSessionsTable)
      .where(eq(clubSessionsTable.clubId, roboticsClub.id))
      .limit(1);

    if (!existingSession) {
      await db.insert(clubSessionsTable).values({
        clubId: roboticsClub.id,
        scheduledDate: "2026-09-16",
        startDatetime: new Date("2026-09-16T15:00:00Z"),
        endDatetime: new Date("2026-09-16T16:30:00Z"),
        locationId: labLocation.id,
        status: "SCHEDULED",
      });
      console.log("📌 Seeded Session: Sept 16, 2026");
    }

    // Announcement
    const [existingAnn] = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.clubId, roboticsClub.id))
      .limit(1);

    if (!existingAnn) {
      await db.insert(announcementsTable).values({
        organizationId: org.id,
        clubId: roboticsClub.id,
        authorMembershipId: advisorMemId,
        title: "Welcome to Robotics & AI Club 2026!",
        content: "We are thrilled to launch the new term. Our first session will cover autonomous sensor navigation.",
      });
      console.log("📢 Seeded Announcement: Welcome post");
    }

    // Badge
    const [existingBadge] = await db
      .select()
      .from(badgesTable)
      .where(and(eq(badgesTable.organizationId, org.id), eq(badgesTable.name, "Robotics Pioneer")))
      .limit(1);

    if (!existingBadge) {
      await db.insert(badgesTable).values({
        organizationId: org.id,
        name: "Robotics Pioneer",
        description: "Awarded for exceptional innovation in robot mechanism assembly.",
        iconUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Pioneer",
      });
      console.log("🏅 Seeded Badge Template: Robotics Pioneer");
    }
  }

  console.log("🎉 Phase 5 seed complete!");
}

if (process.argv[1]?.includes("seed")) {
  seedMain().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}
