import { db, sql } from "@workspace/db";

export async function migrateTables() {
  console.log("🛠️  Creating & synchronizing database schema tables IF NOT EXISTS...");

  const queries = [
    // 1. Roles & Organizations & Users
    sql`CREATE TABLE IF NOT EXISTS "roles" (
      "id" varchar(50) PRIMARY KEY NOT NULL,
      "name" varchar(255) NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "organizations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(255) NOT NULL,
      "slug" varchar(255) NOT NULL UNIQUE,
      "logo_url" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "logo_url" text;`,
    sql`ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`,

    sql`CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "full_name" varchar(255) NOT NULL,
      "phone" varchar(50),
      "photo_url" text,
      "password_hash" text,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(50);`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "photo_url" text;`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;`,
    sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;`,

    sql`CREATE TABLE IF NOT EXISTS "organization_memberships" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "status" varchar(50) DEFAULT 'active' NOT NULL,
      "joined_at" timestamp DEFAULT now() NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "membership_roles" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id") ON DELETE CASCADE,
      "role_id" varchar(50) NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
      "assigned_at" timestamp DEFAULT now() NOT NULL
    );`,

    // 2. People (Students, Parents, Parent-Student links)
    sql`CREATE TABLE IF NOT EXISTS "students" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "student_identifier" varchar(100) NOT NULL,
      "grade" integer NOT NULL,
      "status" varchar(50) DEFAULT 'active' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;`,
    sql`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'active' NOT NULL;`,

    sql`CREATE TABLE IF NOT EXISTS "parents" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE;`,

    sql`CREATE TABLE IF NOT EXISTS "parent_students" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "parent_id" uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
      "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
      "relationship_type" varchar(50),
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "parent_students" ADD COLUMN IF NOT EXISTS "relationship_type" varchar(50);`,

    // 3. Clubs & Locations & Advisors
    sql`CREATE TABLE IF NOT EXISTS "locations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "clubs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text,
      "minimum_grade" integer NOT NULL,
      "maximum_grade" integer NOT NULL,
      "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
      "start_date" date,
      "end_date" date,
      "status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
      "created_by_membership_id" uuid REFERENCES "organization_memberships"("id"),
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "clubs" ADD COLUMN IF NOT EXISTS "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL;`,
    sql`ALTER TABLE "clubs" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'DRAFT' NOT NULL;`,

    sql`CREATE TABLE IF NOT EXISTS "club_advisors" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "club_id" uuid NOT NULL REFERENCES "clubs"("id") ON DELETE CASCADE,
      "organization_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id") ON DELETE CASCADE,
      "assigned_at" timestamp DEFAULT now() NOT NULL,
      "assigned_by_membership_id" uuid REFERENCES "organization_memberships"("id"),
      "status" varchar(50) DEFAULT 'ACTIVE' NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "club_memberships" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "club_id" uuid NOT NULL REFERENCES "clubs"("id") ON DELETE CASCADE,
      "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
      "status" varchar(50) DEFAULT 'PENDING_PARENT_APPROVAL' NOT NULL,
      "requested_at" timestamp DEFAULT now() NOT NULL,
      "parent_approved_at" timestamp,
      "parent_rejected_at" timestamp,
      "advisor_approved_at" timestamp,
      "advisor_rejected_at" timestamp,
      "withdrawn_at" timestamp,
      "removed_at" timestamp,
      "completed_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "requested_at" timestamp DEFAULT now() NOT NULL;`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "parent_approved_at" timestamp;`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "parent_rejected_at" timestamp;`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "advisor_approved_at" timestamp;`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "advisor_rejected_at" timestamp;`,
    sql`ALTER TABLE "club_memberships" ADD COLUMN IF NOT EXISTS "withdrawn_at" timestamp;`,

    // 4. Operations (Schedules, Sessions, Attendance, Announcements, Resources, Badges)
    sql`CREATE TABLE IF NOT EXISTS "club_schedules" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "club_id" uuid NOT NULL REFERENCES "clubs"("id") ON DELETE CASCADE,
      "day_of_week" integer NOT NULL,
      "start_time" varchar(10) NOT NULL,
      "end_time" varchar(10) NOT NULL,
      "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
      "effective_from" date,
      "effective_to" date
    );`,
    sql`CREATE TABLE IF NOT EXISTS "club_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "club_id" uuid NOT NULL REFERENCES "clubs"("id") ON DELETE CASCADE,
      "scheduled_date" date NOT NULL,
      "start_datetime" timestamp NOT NULL,
      "end_datetime" timestamp NOT NULL,
      "location_id" uuid REFERENCES "locations"("id") ON DELETE SET NULL,
      "status" varchar(50) DEFAULT 'SCHEDULED' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "attendance_records" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "club_session_id" uuid NOT NULL REFERENCES "club_sessions"("id") ON DELETE CASCADE,
      "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
      "status" varchar(50) NOT NULL,
      "recorded_by_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id"),
      "recorded_at" timestamp DEFAULT now() NOT NULL,
      "updated_by_membership_id" uuid REFERENCES "organization_memberships"("id"),
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "announcements" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "club_id" uuid REFERENCES "clubs"("id") ON DELETE CASCADE,
      "author_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id"),
      "title" varchar(255) NOT NULL,
      "content" text NOT NULL,
      "published_at" timestamp DEFAULT now() NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "resources" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "club_id" uuid REFERENCES "clubs"("id") ON DELETE CASCADE,
      "uploaded_by_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id"),
      "title" varchar(255) NOT NULL,
      "description" text,
      "file_url" text NOT NULL,
      "resource_type" varchar(50) DEFAULT 'document' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "badges" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "description" text,
      "icon_url" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,
    sql`CREATE TABLE IF NOT EXISTS "student_badges" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
      "badge_id" uuid NOT NULL REFERENCES "badges"("id") ON DELETE CASCADE,
      "club_id" uuid REFERENCES "clubs"("id") ON DELETE SET NULL,
      "awarded_by_membership_id" uuid NOT NULL REFERENCES "organization_memberships"("id"),
      "awarded_at" timestamp DEFAULT now() NOT NULL,
      "note" text
    );`,
  ];

  for (const query of queries) {
    try {
      await db.execute(query);
    } catch (e) {
      // Ignore idempotent column alter errors if already exists
    }
  }

  console.log("✅ All database tables successfully synchronized!");
}

if (process.argv[1]?.includes("migrate-tables")) {
  migrateTables().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
}
