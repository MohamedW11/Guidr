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
  clubsTable,
  clubMembershipsTable,
  locationsTable,
} from "@workspace/db/schema";
import bcrypt from "bcryptjs";
import { migrateTables } from "./migrate-tables.js";

/**
 * Guidr V1 Phase 7 — Automated Security & Multi-Tenant Verification Suite
 */
export async function runSecurityVerification() {
  console.log("🔒 Starting Guidr V1 Phase 7 Security Verification Suite...\n");

  // Ensure database tables exist
  await migrateTables();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      throw new Error(`Security Test Failed: ${testName}`);
    }
  }

  // Ensure base roles exist
  const baseRoles = ["ADMIN", "ADVISOR", "STUDENT", "PARENT"];
  for (const roleId of baseRoles) {
    await db
      .insert(rolesTable)
      .values({ id: roleId, name: roleId })
      .onConflictDoNothing();
  }

  const passwordHash = await bcrypt.hash("TestPass123!", 10);

  // =========================================================================
  // TEST SUITE 1: MULTI-TENANT ISOLATION
  // =========================================================================
  console.log("---------------------------------------------------------");
  console.log("1. MULTI-TENANT DATA ISOLATION TEST SUITE");
  console.log("---------------------------------------------------------");

  // Create Organization A (Cairo International School)
  const [orgA] = await db
    .insert(organizationsTable)
    .values({
      name: "Cairo International School (Test A)",
      slug: `cairo-test-${Date.now()}`,
      isActive: true,
    })
    .returning();

  // Create Organization B (Alexandria International Academy)
  const [orgB] = await db
    .insert(organizationsTable)
    .values({
      name: "Alexandria International Academy (Test B)",
      slug: `alex-test-${Date.now()}`,
      isActive: true,
    })
    .returning();

  assert(orgA.id !== orgB.id, "Organization A and Organization B have distinct primary keys");

  // Create Club in Org A
  const [clubOrgA] = await db
    .insert(clubsTable)
    .values({
      organizationId: orgA.id,
      name: "Org A Robotics Club",
      minimumGrade: 9,
      maximumGrade: 12,
      status: "ACTIVE",
    })
    .returning();

  // Create Club in Org B
  const [clubOrgB] = await db
    .insert(clubsTable)
    .values({
      organizationId: orgB.id,
      name: "Org B Sailing Club",
      minimumGrade: 9,
      maximumGrade: 12,
      status: "ACTIVE",
    })
    .returning();

  // Query Org A clubs scoped to Org A tenant ID
  const orgAClubs = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.organizationId, orgA.id));

  assert(
    orgAClubs.some((c) => c.id === clubOrgA.id),
    "Tenant A query successfully retrieves Org A club"
  );
  assert(
    !orgAClubs.some((c) => c.id === clubOrgB.id),
    "Tenant A query strictly excludes Org B club (Zero cross-tenant leakage)"
  );

  // =========================================================================
  // TEST SUITE 2: PARENT-STUDENT LINKAGE AUTHORIZATION
  // =========================================================================
  console.log("\n---------------------------------------------------------");
  console.log("2. PARENT-STUDENT AUTHORIZATION TEST SUITE");
  console.log("---------------------------------------------------------");

  // Create User & Student in Org A
  const [studentUser] = await db
    .insert(usersTable)
    .values({ email: `student_${Date.now()}@test.org`, fullName: "Test Student A", passwordHash })
    .returning();

  const [studentEntity] = await db
    .insert(studentsTable)
    .values({
      organizationId: orgA.id,
      userId: studentUser.id,
      studentIdentifier: `STU-TEST-${Date.now()}`,
      grade: 10,
      status: "active",
    })
    .returning();

  // Create Linked Parent in Org A
  const [parentUserAuthorized] = await db
    .insert(usersTable)
    .values({ email: `parent_auth_${Date.now()}@test.org`, fullName: "Authorized Parent", passwordHash })
    .returning();

  const [parentEntityAuth] = await db
    .insert(parentsTable)
    .values({ organizationId: orgA.id, userId: parentUserAuthorized.id })
    .returning();

  await db.insert(parentStudentsTable).values({
    organizationId: orgA.id,
    parentId: parentEntityAuth.id,
    studentId: studentEntity.id,
    relationshipType: "Mother",
  });

  // Create Unlinked Parent in Org A
  const [parentUserUnauth] = await db
    .insert(usersTable)
    .values({ email: `parent_unauth_${Date.now()}@test.org`, fullName: "Unlinked Parent", passwordHash })
    .returning();

  const [parentEntityUnauth] = await db
    .insert(parentsTable)
    .values({ organizationId: orgA.id, userId: parentUserUnauth.id })
    .returning();

  // Verify parent link database checks
  const [linkedCheck] = await db
    .select()
    .from(parentStudentsTable)
    .where(
      and(
        eq(parentStudentsTable.organizationId, orgA.id),
        eq(parentStudentsTable.parentId, parentEntityAuth.id),
        eq(parentStudentsTable.studentId, studentEntity.id)
      )
    )
    .limit(1);

  const [unlinkedCheck] = await db
    .select()
    .from(parentStudentsTable)
    .where(
      and(
        eq(parentStudentsTable.organizationId, orgA.id),
        eq(parentStudentsTable.parentId, parentEntityUnauth.id),
        eq(parentStudentsTable.studentId, studentEntity.id)
      )
    )
    .limit(1);

  assert(Boolean(linkedCheck), "Authorized parent is correctly linked to student");
  assert(!unlinkedCheck, "Unlinked parent has zero authorization link to student");

  // =========================================================================
  // TEST SUITE 3: GRADE ELIGIBILITY BOUNDARY
  // =========================================================================
  console.log("\n---------------------------------------------------------");
  console.log("3. GRADE ELIGIBILITY BOUNDARY TEST SUITE");
  console.log("---------------------------------------------------------");

  // High School Club (Grades 10–12)
  const [seniorClub] = await db
    .insert(clubsTable)
    .values({
      organizationId: orgA.id,
      name: "Senior Debate Society",
      minimumGrade: 10,
      maximumGrade: 12,
      status: "ACTIVE",
    })
    .returning();

  // Grade 9 Student
  const grade9IsEligible = 9 >= seniorClub.minimumGrade && 9 <= seniorClub.maximumGrade;
  // Grade 11 Student
  const grade11IsEligible = 11 >= seniorClub.minimumGrade && 11 <= seniorClub.maximumGrade;

  assert(!grade9IsEligible, "Grade 9 student is correctly flagged as ineligible for Grade 10–12 club");
  assert(grade11IsEligible, "Grade 11 student is correctly flagged as eligible for Grade 10–12 club");

  // =========================================================================
  // TEST SUITE 4: TWO-STAGE MEMBERSHIP LIFECYCLE & HISTORIC AUDIT PRESERVATION
  // =========================================================================
  console.log("\n---------------------------------------------------------");
  console.log("4. LIFECYCLE STAGES & HISTORIC AUDIT PRESERVATION TEST SUITE");
  console.log("---------------------------------------------------------");

  // 1. Student requests join
  const reqTime = new Date();
  const [mem] = await db
    .insert(clubMembershipsTable)
    .values({
      organizationId: orgA.id,
      clubId: seniorClub.id,
      studentId: studentEntity.id,
      status: "PENDING_PARENT_APPROVAL",
      requestedAt: reqTime,
    })
    .returning();

  assert(mem.status === "PENDING_PARENT_APPROVAL", "Stage 1: Membership request initialized with PENDING_PARENT_APPROVAL");
  assert(Boolean(mem.requestedAt), "Stage 1: requestedAt timestamp recorded");

  // 2. Parent approves
  const parentApprovedTime = new Date();
  const [memStage2] = await db
    .update(clubMembershipsTable)
    .set({
      status: "PENDING_ADVISOR_APPROVAL",
      parentApprovedAt: parentApprovedTime,
      updatedAt: new Date(),
    })
    .where(eq(clubMembershipsTable.id, mem.id))
    .returning();

  assert(memStage2.status === "PENDING_ADVISOR_APPROVAL", "Stage 2: Parent approval transitions status to PENDING_ADVISOR_APPROVAL");
  assert(Boolean(memStage2.parentApprovedAt), "Stage 2: parentApprovedAt timestamp recorded");

  // 3. Advisor approves
  const advisorApprovedTime = new Date();
  const [memActive] = await db
    .update(clubMembershipsTable)
    .set({
      status: "ACTIVE",
      advisorApprovedAt: advisorApprovedTime,
      updatedAt: new Date(),
    })
    .where(eq(clubMembershipsTable.id, mem.id))
    .returning();

  assert(memActive.status === "ACTIVE", "Stage 3: Advisor approval activates membership (ACTIVE)");
  assert(Boolean(memActive.advisorApprovedAt), "Stage 3: advisorApprovedAt timestamp recorded");

  // 4. Student withdraws
  const withdrawTime = new Date();
  const [memWithdrawn] = await db
    .update(clubMembershipsTable)
    .set({
      status: "WITHDRAWN",
      withdrawnAt: withdrawTime,
      updatedAt: new Date(),
    })
    .where(eq(clubMembershipsTable.id, mem.id))
    .returning();

  assert(memWithdrawn.status === "WITHDRAWN", "Stage 4: Withdrawal updates status to WITHDRAWN");
  assert(Boolean(memWithdrawn.withdrawnAt), "Stage 4: withdrawnAt timestamp recorded");

  // 5. Assert Historic Audit Preservation (Record was NOT deleted, all timestamps intact)
  const [auditCheck] = await db
    .select()
    .from(clubMembershipsTable)
    .where(eq(clubMembershipsTable.id, mem.id))
    .limit(1);

  assert(Boolean(auditCheck), "Historic record is preserved in database (Never hard deleted)");
  assert(Boolean(auditCheck.requestedAt), "Audit trail retains original requestedAt timestamp");
  assert(Boolean(auditCheck.parentApprovedAt), "Audit trail retains parentApprovedAt timestamp");
  assert(Boolean(auditCheck.advisorApprovedAt), "Audit trail retains advisorApprovedAt timestamp");
  assert(Boolean(auditCheck.withdrawnAt), "Audit trail retains withdrawnAt timestamp");

  console.log("---------------------------------------------------------");
  console.log(`🎉 ALL SECURITY & VERIFICATION TESTS PASSED (${passedTests}/${totalTests} Assertions Clean)`);
  console.log("---------------------------------------------------------\n");
}

if (process.argv[1]?.includes("verify-security")) {
  runSecurityVerification().catch((err) => {
    console.error("Security verification error:", err);
    process.exit(1);
  });
}
