# Guidr V1 — Complete Technical Product Specification

**Version:** 1.0  
**Status:** Founder Reference Document  
**Market:** International Schools in Egypt  
**Product Type:** Multi-tenant B2B SaaS Student Life Management Platform  
**V1 Product Focus:** School Club Management

---

# Table of Contents

1. Product Definition
2. Product Scope
3. Core Principles
4. Multi-Tenant Architecture
5. Users, Identity, Memberships, and Roles
6. Permission Model
7. Organization and Authentication Architecture
8. Club Domain Model
9. Membership and Approval Workflow
10. Business Rules
11. System Architecture
12. Recommended Technology Architecture
13. Database Design Overview
14. Database Schema
15. Entity Relationships
16. API Architecture
17. API Endpoints
18. Frontend Architecture
19. Frontend Pages
20. Shared Components
21. Backend Modules
22. Notifications
23. File and Resource Architecture
24. Scheduling and Attendance
25. Data Isolation and Security
26. Scaling Beyond Clubs
27. Development Order
28. Testing Strategy
29. AI-Agent Development Rules
30. Final V1 Definition
31. Architecture Review Checklist

---

# 1. Product Definition

Guidr is a multi-tenant Student Life Management System for international schools in Egypt.

A school uses Guidr as an organization-specific platform to manage student activities and connect the people involved in student life:

- Administrators
- Advisors
- Students
- Parents

Guidr V1 establishes the foundation of the platform through one activity type:

> School Clubs

The long-term product can expand into:

- Sports
- Events
- Trips
- Competitions
- Programs
- Student organizations
- Other student-life activities

V1 must therefore solve the club problem without creating an architecture that prevents future expansion.

---

# 2. V1 Product Scope

## Included

- Multi-tenant organizations
- Authentication
- Organization memberships
- Multiple roles per user
- Admin management
- Student management
- Parent-child relationships
- Advisor assignments
- Club creation
- Club discovery
- Grade eligibility
- Parent approval
- Advisor approval
- Club memberships
- Schedules
- Sessions
- Attendance
- Announcements
- Resources
- Badges
- Notifications
- Archive/history

## Not required for initial V1

- Payments
- Sports-specific functionality
- Trips-specific functionality
- Advanced analytics
- Public marketplace
- Cross-school student interaction
- Full school academic management
- Complex financial accounting

These can be future modules.

---

# 3. Core Principles

## Principle 1 — Organization data isolation

Every school is an independent tenant.

School A must never access School B's data unless the same authenticated person explicitly belongs to both organizations.

## Principle 2 — Global identity, local membership

A person's account is global.

Their relationship to a school is organization-specific.

Example:

A person may be:

- Parent at School A
- Advisor at School B

This should be represented through organization memberships and roles, not duplicate user accounts.

## Principle 3 — Permissions are not frontend-only

The frontend may hide actions, but the backend must enforce permissions.

## Principle 4 — Build reusable foundations

Clubs should reuse generic concepts where possible:

- Organization
- User
- Membership
- Participant
- Schedule
- Location
- Notification
- Announcement
- Attendance

## Principle 5 — Do not over-generalize too early

Do not force sports, trips, and clubs into one giant generic table before their requirements are known.

The correct approach is:

> Shared foundation + specialized modules.

---

# 4. Multi-Tenant Architecture

## Tenant

In Guidr, a school is an:

> Organization

Example:

Organization:
- Cairo International School

Every school-owned record must have an organization boundary.

Examples:

- organization_id on clubs
- organization membership records
- school users
- parent-child relationships
- locations
- notifications where appropriate

## Request context

Every authenticated request should determine:

1. Who is the authenticated user?
2. Which organization are they currently accessing?
3. Does the user belong to that organization?
4. Which roles does the user have there?
5. Does the user have permission for the requested action?

Conceptually:

```text
Authenticated User
        ↓
Organization Context
        ↓
Organization Membership
        ↓
Roles
        ↓
Permissions
        ↓
Authorized Resource Access
```

---

# 5. Users, Identity, Memberships, and Roles

## User

A global identity.

A user should not be duplicated simply because they belong to multiple schools.

Typical fields:

- id
- full_name
- email
- phone
- photo_url
- authentication fields
- created_at
- updated_at

## Organization Membership

Connects a user to a school.

Conceptually:

```text
User
  ↓
OrganizationMembership
  ↓
Organization
```

A membership can contain multiple roles.

Example:

Mohamed:
- Organization A → Parent
- Organization B → Advisor

Another example:

A school employee could be:

- Advisor
- Admin

within the same organization.

This supports the approved Guidr decision:

> A user can have multiple roles in the same organization.

---

# 6. Permission Model

Roles describe broad responsibilities.

Permissions describe allowed actions.

For V1, role-based access control (RBAC) is sufficient.

## Admin

School-wide management.

Can:

- Create clubs
- Edit clubs
- Archive clubs
- Assign advisors
- View organization users
- Manage users
- Import users
- View activities
- View school-wide schedule
- Edit attendance
- Review relevant requests

## Advisor

Limited to assigned activities.

Can:

- View assigned clubs
- Manage members
- Review membership requests after parent approval
- Take attendance
- Add announcements
- Add resources
- Award badges
- View relevant parent information
- Request additional advisors

Cannot access unrelated clubs.

## Student

Can:

- Browse eligible clubs
- Request membership
- View enrolled activities
- View schedule
- View attendance
- Read announcements
- Access resources
- View badges
- Withdraw when allowed

Cannot edit protected school information.

## Parent

Can:

- Switch between linked children
- View child activities
- View child schedule
- View relevant progress
- Approve/reject participation
- Withdraw consent where allowed

---

# 7. Organization and Authentication Architecture

## Authentication

Authentication answers:

> Who are you?

Organization membership answers:

> Which schools do you belong to?

Role answers:

> What can you do in this school?

These must remain separate concepts.

## Login flow

```text
Login
  ↓
Authenticate User
  ↓
Find Organization Memberships
  ↓
One organization?
 ├─ Yes → Enter organization
 └─ No → Organization selector
              ↓
       Select organization
              ↓
      Load roles/permissions
              ↓
           Dashboard
```

## URL strategy

Recommended:

```text
app.guidr.com/[organization-slug]/...
```

Example:

```text
app.guidr.com/cairo-international-school/dashboard
```

This is simple for V1.

Future custom domains or subdomains can be added later.

---

# 8. Club Domain Model

A club is an organization-owned activity.

## Club fields

- id
- organization_id
- name
- description
- minimum_grade
- maximum_grade
- location_id
- start_date
- end_date
- status
- created_by
- created_at
- updated_at

## Club status

Recommended:

- DRAFT
- ACTIVE
- COMPLETED
- ARCHIVED

## Club advisors

A club can have one or more advisors.

This requires a separate relationship table.

## Club members

Students do not simply become members directly.

Membership has a lifecycle.

---

# 9. Membership and Approval Workflow

## State model

Recommended membership/request states:

- PENDING_PARENT_APPROVAL
- PARENT_REJECTED
- PENDING_ADVISOR_APPROVAL
- ADVISOR_REJECTED
- ACTIVE
- WITHDRAWN
- REMOVED
- COMPLETED

## Main flow

```text
Student requests club
        ↓
PENDING_PARENT_APPROVAL
        ↓
Parent approves
        ↓
PENDING_ADVISOR_APPROVAL
        ↓
Advisor approves
        ↓
ACTIVE
```

If rejected, the workflow ends with the appropriate rejection state.

## Withdrawal

Student withdrawal should follow the approved business rules.

The system should preserve historical membership records rather than deleting the database row.

---

# 10. Business Rules

## Student profile management

Students cannot modify protected school-managed fields.

Examples:

- Student ID
- Grade

These are managed by administrators/import processes.

## Eligibility

A student can only join a club when they satisfy the configured grade range.

## Parent approval

Membership cannot move to advisor approval before parent approval.

## Advisor approval

A student becomes ACTIVE only after advisor approval.

## Advisor scope

An advisor can only manage clubs assigned to them.

## Admin scope

Admins can manage organization-wide data according to permissions.

## Archive

Historical clubs remain visible according to permissions.

Archived clubs should not accept normal new memberships.

## Attendance

Attendance belongs to a specific session and student membership.

Admins may edit attendance according to the approved rules.

---

# 11. System Architecture

Recommended high-level architecture:

```text
                    ┌───────────────────┐
                    │     Frontend      │
                    │ Next.js / React   │
                    └─────────┬─────────┘
                              │ HTTPS
                              ▼
                    ┌───────────────────┐
                    │       API         │
                    │ Backend Service   │
                    └─────────┬─────────┘
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
       ┌───────────┐   ┌────────────┐   ┌─────────────┐
       │PostgreSQL │   │ File Store │   │Notification │
       │ Database  │   │ Resources  │   │   Service   │
       └───────────┘   └────────────┘   └─────────────┘
```

## Recommended architectural approach

Start with a:

> Modular monolith

Do NOT begin with microservices.

The backend can contain modules such as:

```text
Auth Module
Organizations Module
Users Module
Roles Module
Clubs Module
Memberships Module
Schedules Module
Attendance Module
Announcements Module
Resources Module
Badges Module
Notifications Module
```

A modular monolith is easier to build, test, and maintain while Guidr is early-stage.

---

# 12. Recommended Technology Architecture

A practical stack for Guidr:

## Frontend

- Next.js
- React
- TypeScript

## Backend

One of:

- FastAPI + Python
- NestJS + TypeScript


## Database

- PostgreSQL

## ORM

Choose one based on backend:

Python:
- SQLAlchemy

TypeScript:
- Prisma or equivalent

## File storage

Object storage for:

- Resources
- Uploaded documents
- Images

Do not store large files directly inside PostgreSQL.

---

# 13. Database Design Overview

The core database domains are:

```text
IDENTITY
- users

MULTI-TENANCY
- organizations
- organization_memberships
- membership_roles

PEOPLE
- students
- parents
- parent_students

CLUBS
- clubs
- club_advisors
- club_memberships

SCHEDULING
- locations
- club_schedules
- club_sessions

OPERATIONS
- attendance_records
- announcements
- resources
- badges
- student_badges

COMMUNICATION
- notifications

ADMINISTRATION
- import_jobs
- audit_logs
```

---

# 14. Database Schema

## 14.1 users

```text
users
-----
id (UUID, PK)
full_name
email (unique)
phone
photo_url
password_hash / auth_provider_reference
is_active
created_at
updated_at
```

Purpose:

Global identity.

---

## 14.2 organizations

```text
organizations
-------------
id (UUID, PK)
name
slug (unique)
logo_url
is_active
created_at
updated_at
```

Purpose:

Represents a school tenant.

---

## 14.3 organization_memberships

```text
organization_memberships
------------------------
id (UUID, PK)
organization_id (FK)
user_id (FK)
status
created_at
updated_at

UNIQUE(organization_id, user_id)
```

Purpose:

Connects a user to an organization.

---

## 14.4 roles

```text
roles
-----
id
name
```

Initial roles:

- ADMIN
- ADVISOR
- STUDENT
- PARENT

---

## 14.5 membership_roles

```text
membership_roles
----------------
organization_membership_id (FK)
role_id (FK)

PRIMARY KEY (
  organization_membership_id,
  role_id
)
```

Purpose:

Supports multiple roles for one user in the same organization.

---

## 14.6 students

```text
students
--------
id (UUID, PK)
organization_id (FK)
user_id (FK, nullable if invitation/import flow requires it)
student_identifier
grade
status
created_at
updated_at

UNIQUE(organization_id, student_identifier)
```

Student fields approved for management include:

- Student ID
- Photo through user profile
- Email
- Phone

Grade is organization-managed.

---

## 14.7 parents

```text
parents
-------
id (UUID, PK)
organization_id (FK)
user_id (FK)
created_at
updated_at
```

---

## 14.8 parent_students

```text
parent_students
---------------
id (UUID, PK)
organization_id (FK)
parent_id (FK)
student_id (FK)
relationship_type
created_at

UNIQUE(parent_id, student_id)
```

Purpose:

Supports multiple children per parent.

---

## 14.9 advisors

A separate advisor profile is optional.

Recommended V1:

Use organization membership + ADVISOR role.

If advisor-specific data becomes necessary, add:

```text
advisor_profiles
```

Do not duplicate identity data unnecessarily.

---

## 14.10 locations

```text
locations
---------
id (UUID, PK)
organization_id (FK)
name
description
created_at
updated_at
```

Examples:

- Lab 2
- Football Field
- Auditorium

---

## 14.11 clubs

```text
clubs
-----
id (UUID, PK)
organization_id (FK)
name
description
minimum_grade
maximum_grade
location_id (FK, nullable)
start_date
end_date
status
created_by_membership_id (FK)
created_at
updated_at
```

---

## 14.12 club_advisors

```text
club_advisors
-------------
id (UUID, PK)
club_id (FK)
organization_membership_id (FK)
assigned_at
assigned_by_membership_id (FK)
status

UNIQUE(club_id, organization_membership_id)
```

---

## 14.13 club_memberships

This is one of the most important tables.

```text
club_memberships
----------------
id (UUID, PK)
organization_id (FK)
club_id (FK)
student_id (FK)

status

requested_at

parent_approved_at
parent_rejected_at

advisor_approved_at
advisor_rejected_at

withdrawn_at
removed_at
completed_at

created_at
updated_at
```

The record is preserved for history.

Avoid deleting membership history.

---

## 14.14 club_schedules

For recurring schedules.

```text
club_schedules
--------------
id (UUID, PK)
club_id (FK)
day_of_week
start_time
end_time
location_id (FK)
effective_from
effective_to
```

---

## 14.15 club_sessions

Represents actual occurrences.

```text
club_sessions
-------------
id (UUID, PK)
club_id (FK)
scheduled_date
start_datetime
end_datetime
location_id (FK)
status
created_at
updated_at
```

Possible session status:

- SCHEDULED
- COMPLETED
- CANCELLED

---

## 14.16 attendance_records

```text
attendance_records
------------------
id (UUID, PK)
club_session_id (FK)
student_id (FK)
status
recorded_by_membership_id (FK)
recorded_at
updated_by_membership_id (FK, nullable)
updated_at

UNIQUE(club_session_id, student_id)
```

Suggested attendance status:

- PRESENT
- ABSENT
- LATE
- EXCUSED

---

## 14.17 announcements

```text
announcements
-------------
id (UUID, PK)
organization_id (FK)
club_id (FK)
author_membership_id (FK)
title
content
published_at
created_at
updated_at
```

---

## 14.18 resources

```text
resources
---------
id (UUID, PK)
organization_id (FK)
club_id (FK)
uploaded_by_membership_id (FK)
title
description
file_url
resource_type
created_at
```

---

## 14.19 badges

Recommended structure:

```text
badges
------
id (UUID, PK)
organization_id (FK)
name
description
icon_url
created_at
```

---

## 14.20 student_badges

```text
student_badges
--------------
id (UUID, PK)
student_id (FK)
badge_id (FK)
club_id (FK, nullable)
awarded_by_membership_id (FK)
awarded_at
note
```

This allows badges to appear in the student profile.

---

## 14.21 notifications

```text
notifications
-------------
id (UUID, PK)
organization_id (FK)
recipient_membership_id (FK)
type
title
message
entity_type
entity_id
is_read
created_at
```

The entity reference allows a notification to link to:

- Club
- Membership request
- Announcement
- Session

---

## 14.22 import_jobs

```text
import_jobs
-----------
id (UUID, PK)
organization_id (FK)
created_by_membership_id (FK)
file_name
status
summary
created_at
completed_at
```

Supports CSV/Excel user imports.

---

## 14.23 audit_logs

Recommended for school administration.

```text
audit_logs
----------
id (UUID, PK)
organization_id (FK)
actor_membership_id (FK)
action
entity_type
entity_id
metadata
created_at
```

Important examples:

- Admin changed student grade
- Advisor changed attendance
- Admin archived club

---

# 15. Entity Relationships

Simplified model:

```text
USER
 │
 └── ORGANIZATION MEMBERSHIP ─── ORGANIZATION
          │
          └── ROLES

ORGANIZATION
 │
 ├── STUDENTS ─────────────── PARENTS
 │        │                      │
 │        └──── PARENT_STUDENTS ─┘
 │
 ├── LOCATIONS
 │
 └── CLUBS
       │
       ├── CLUB_ADVISORS
       │
       ├── CLUB_MEMBERSHIPS ─── STUDENTS
       │
       ├── CLUB_SCHEDULES
       │
       ├── CLUB_SESSIONS
       │        │
       │        └── ATTENDANCE_RECORDS
       │
       ├── ANNOUNCEMENTS
       ├── RESOURCES
       └── STUDENT_BADGES
```

---

# 16. API Architecture

Use REST for V1.

Base example:

```text
/api/v1
```

Organization context can be represented by:

```text
/api/v1/organizations/{organization_id}/...
```

or derived securely from the active organization context.

Recommended design principle:

> Never trust an organization ID from the frontend without verifying that the authenticated user belongs to it.

---

# 17. API Endpoints

## Authentication

```text
POST   /auth/login
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

---

## Organizations

```text
GET    /organizations
GET    /organizations/{id}
```

The authenticated user should only receive organizations they belong to.

---

## Users

```text
GET    /organizations/{orgId}/users
POST   /organizations/{orgId}/users
GET    /organizations/{orgId}/users/{userId}
PATCH  /organizations/{orgId}/users/{userId}
```

---

## Imports

```text
POST   /organizations/{orgId}/users/import
GET    /organizations/{orgId}/imports/{importId}
```

The import endpoint should support CSV/Excel according to the chosen implementation.

---

## Clubs

```text
GET    /organizations/{orgId}/clubs
POST   /organizations/{orgId}/clubs

GET    /organizations/{orgId}/clubs/{clubId}
PATCH  /organizations/{orgId}/clubs/{clubId}

POST   /organizations/{orgId}/clubs/{clubId}/publish
POST   /organizations/{orgId}/clubs/{clubId}/archive
```

---

## Club advisors

```text
GET    /organizations/{orgId}/clubs/{clubId}/advisors
POST   /organizations/{orgId}/clubs/{clubId}/advisors
DELETE /organizations/{orgId}/clubs/{clubId}/advisors/{membershipId}
```

Admin permission required for assignment.

---

## Club discovery

```text
GET /organizations/{orgId}/clubs/explore
```

Backend should return only appropriate visibility information and eligibility status.

---

## Membership requests

```text
POST /organizations/{orgId}/clubs/{clubId}/join
GET  /organizations/{orgId}/clubs/{clubId}/memberships
GET  /organizations/{orgId}/membership-requests
```

---

## Parent decisions

```text
POST /organizations/{orgId}/club-memberships/{id}/parent-approve
POST /organizations/{orgId}/club-memberships/{id}/parent-reject
```

Backend verifies that the authenticated parent is connected to that student.

---

## Advisor decisions

```text
POST /organizations/{orgId}/club-memberships/{id}/advisor-approve
POST /organizations/{orgId}/club-memberships/{id}/advisor-reject
```

Backend verifies advisor assignment to that club.

---

## Withdrawal

```text
POST /organizations/{orgId}/club-memberships/{id}/withdraw
```

Business rules determine whether:

- Student can withdraw
- Parent can withdraw consent
- Limits apply

---

## Schedules

```text
GET    /organizations/{orgId}/schedule
GET    /organizations/{orgId}/clubs/{clubId}/schedule
POST   /organizations/{orgId}/clubs/{clubId}/schedule
PATCH  /organizations/{orgId}/club-schedules/{id}
DELETE /organizations/{orgId}/club-schedules/{id}
```

---

## Sessions

```text
GET    /organizations/{orgId}/clubs/{clubId}/sessions
POST   /organizations/{orgId}/clubs/{clubId}/sessions
PATCH  /organizations/{orgId}/club-sessions/{id}
```

---

## Attendance

```text
GET  /organizations/{orgId}/club-sessions/{sessionId}/attendance
POST /organizations/{orgId}/club-sessions/{sessionId}/attendance
PATCH /organizations/{orgId}/attendance/{attendanceId}
```

Advisor assignment must be verified.

---

## Announcements

```text
GET    /organizations/{orgId}/clubs/{clubId}/announcements
POST   /organizations/{orgId}/clubs/{clubId}/announcements
PATCH  /organizations/{orgId}/announcements/{id}
DELETE /organizations/{orgId}/announcements/{id}
```

---

## Resources

```text
GET    /organizations/{orgId}/clubs/{clubId}/resources
POST   /organizations/{orgId}/clubs/{clubId}/resources
DELETE /organizations/{orgId}/resources/{id}
```

---

## Badges

```text
GET  /organizations/{orgId}/badges
POST /organizations/{orgId}/badges

POST /organizations/{orgId}/students/{studentId}/badges
GET  /organizations/{orgId}/students/{studentId}/badges
```

---

## Parent children

```text
GET /organizations/{orgId}/my-children
GET /organizations/{orgId}/children/{studentId}
GET /organizations/{orgId}/children/{studentId}/activities
```

The backend verifies parent-child authorization.

---

## Notifications

```text
GET   /organizations/{orgId}/notifications
POST  /organizations/{orgId}/notifications/{id}/read
POST  /organizations/{orgId}/notifications/read-all
```

---

# 18. Frontend Architecture

Recommended structure:

```text
app/
├── login/
├── select-organization/
│
└── [organizationSlug]/
    ├── dashboard/
    ├── notifications/
    ├── profile/
    │
    ├── clubs/
    │   ├── explore/
    │   ├── create/
    │   └── [clubId]/
    │
    ├── users/
    ├── requests/
    ├── schedule/
    │
    ├── my-clubs/
    ├── my-schedule/
    │
    ├── my-children/
    └── children/
```

The exact route structure may change, but the important architecture is:

- Organization context
- Shared app shell
- Permission-aware routes
- Reusable domain components

---

# 19. Frontend Pages

## Authentication

### `/login`

- Email/phone
- Password
- Forgot password

### `/select-organization`

Shown when the user belongs to multiple organizations.

---

## Shared

### `/[organization]/dashboard`

Role-aware dashboard.

### `/[organization]/notifications`

Notification center.

### `/[organization]/profile`

User profile.

---

## Admin

### `/[organization]/clubs`

All school clubs.

### `/[organization]/clubs/create`

Create club.

### `/[organization]/clubs/[clubId]`

Club workspace.

Tabs:

- Overview
- Members
- Advisors
- Schedule
- Sessions
- Attendance
- Announcements
- Resources
- Badges

### `/[organization]/users`

School user management.

### `/[organization]/users/[userId]`

User profile management.

### `/[organization]/requests`

Central administrative requests.

### `/[organization]/schedule`

School-wide activity schedule.

---

## Advisor

### `/[organization]/my-clubs`

Assigned clubs.

### `/[organization]/clubs/[clubId]`

Permission-aware club workspace.

### `/[organization]/advisor-requests`

Additional advisor requests.

---

## Student

### `/[organization]/clubs/explore`

Browse eligible clubs.

### `/[organization]/clubs/[clubId]`

Club details.

### `/[organization]/my-clubs`

Enrolled clubs.

### `/[organization]/my-schedule`

Combined student activity schedule.

---

## Parent

### `/[organization]/my-children`

Child switching.

### `/[organization]/children/[studentId]`

Child dashboard.

### `/[organization]/children/[studentId]/requests`

Approval requests.

### `/[organization]/children/[studentId]/clubs/[clubId]`

Child activity view.

---

# 20. Shared Components

Build reusable components.

## Application

- AppShell
- Sidebar
- Mobile navigation
- Top bar
- Organization switcher
- Profile menu
- Notification center
- PermissionGuard

## Clubs

- ClubCard
- ClubHeader
- ClubStatusBadge
- MemberTable
- AdvisorList
- ScheduleView
- SessionList
- AttendanceTable
- AnnouncementFeed
- ResourceList
- BadgeList

## Users

- UserAvatar
- UserCard
- UserProfileHeader
- RoleBadge

## Tables

Use reusable:

- Search
- Filters
- Pagination
- Empty states
- Loading states

---

# 21. Backend Modules

Recommended modular structure:

```text
src/
├── auth/
├── organizations/
├── users/
├── roles/
├── students/
├── parents/
├── clubs/
├── memberships/
├── schedules/
├── sessions/
├── attendance/
├── announcements/
├── resources/
├── badges/
├── notifications/
├── imports/
├── audit/
└── shared/
```

Each module should own:

- Routes/controllers
- Service/business logic
- Database access
- Validation schemas
- Permission checks

---

# 22. Notifications

Important notification events:

## Membership

- Parent approval required
- Parent approved
- Parent rejected
- Advisor approval required
- Advisor approved
- Advisor rejected

## Club

- New announcement
- Schedule changed
- Session cancelled

## Administration

- Import completed
- Advisor request approved/rejected

Notifications should link to the relevant entity.

---

# 23. File and Resource Architecture

Resources may include:

- PDFs
- Documents
- Images
- Links

Recommended:

```text
Database
   ↓ stores metadata + URL
Object Storage
   ↓ stores actual file
```

Never place large uploaded files directly in the relational database.

---

# 24. Scheduling and Attendance

## Schedule

The schedule describes expected recurring activity timing.

Example:

```text
Wednesday
3:00 PM–4:30 PM
Lab 2
```

## Session

A session is an actual occurrence.

Example:

```text
Robotics Club
September 17, 2026
3:00 PM
Lab 2
```

This distinction is important.

Attendance should attach to the actual session, not merely the recurring schedule.

---

# 25. Data Isolation and Security

Every protected request should follow this conceptual check:

```text
1. Authenticate user
2. Load active organization
3. Verify organization membership
4. Load roles
5. Verify permission
6. Verify resource belongs to organization
7. Perform action
```

Example:

A user cannot request:

```text
GET /organizations/school-A/clubs/club-from-school-B
```

and receive data.

The backend must verify resource ownership.

---

# 26. Scaling Beyond Clubs

Guidr's future architecture should become:

```text
Student Life Platform
│
├── Club Management
├── Sports Management
├── Event Management
├── Trip Management
└── Other Activity Modules
```

Shared platform services:

```text
Organizations
Users
Roles
Parents
Students
Notifications
Scheduling
Locations
Files
Permissions
Audit Logs
```

Specialized modules add their own requirements.

Example:

## Sports

- Teams
- Coaches
- Matches

## Trips

- Permission forms
- Transportation
- Emergency information

## Events

- Registration
- Capacity
- Tickets or payments in future

Therefore:

> Share infrastructure, not necessarily every business table.

---

# 27. Recommended Development Order

## Phase 0 — Product Specification

Complete:

- Requirements
- Business rules
- Roles
- Permissions
- Workflows

## Phase 1 — Technical Foundation

Build:

- Repository
- Environment configuration
- Database
- Authentication
- Organizations
- Organization memberships
- Roles

## Phase 2 — User Domain

Build:

- Users
- Students
- Parents
- Parent-student relationships
- Import/manual onboarding

## Phase 3 — Club Domain

Build:

- Clubs
- Grade eligibility
- Locations
- Advisor assignments

## Phase 4 — Membership Workflow

Build:

- Join request
- Parent approval
- Advisor approval
- Active membership
- Withdrawal

## Phase 5 — Club Operations

Build:

- Schedules
- Sessions
- Attendance
- Announcements
- Resources
- Badges

## Phase 6 — Frontend

Build role-aware:

- Navigation
- Dashboards
- Club pages
- Parent child switching

## Phase 7 — Security and Testing

Test:

- Tenant isolation
- Permissions
- Parent authorization
- Advisor scope
- Membership states
- Archive behavior

---

# 28. Testing Strategy

## Unit tests

Test business logic:

- Eligibility
- Permission checks
- State transitions

## Integration tests

Test:

- API + database
- Membership workflow
- Parent-child authorization

## End-to-end tests

Test complete journeys.

Example:

```text
Admin creates club
↓
Student requests membership
↓
Parent approves
↓
Advisor approves
↓
Student sees active membership
↓
Advisor records attendance
```

## Multi-tenant tests

This is critical.

Create:

- School A
- School B

Verify users from School A cannot access School B resources.

---

# 29. AI-Agent Development Rules

Because the founder is using AI agents for implementation:

## Never prompt:

> Build the entire Guidr application.

Instead, work feature by feature.

For every feature:

1. Read this specification.
2. Identify affected modules.
3. Identify database changes.
4. Identify API changes.
5. Identify frontend changes.
6. Implement.
7. Run tests.
8. Review authorization.
9. Commit/document the change.

## The AI agent must not:

- Invent new architecture randomly
- Change the database without migration
- Bypass organization isolation
- Put authorization only in the frontend
- Duplicate user identities unnecessarily
- Delete historical records casually

---

# 30. Final V1 Definition

Guidr V1 is:

> A multi-tenant B2B Student Life Management Platform for international schools in Egypt, initially focused on managing school clubs and connecting administrators, advisors, students, and parents.

The core workflow is:

```text
Admin creates club
        ↓
Admin assigns advisor
        ↓
Student discovers eligible club
        ↓
Student requests membership
        ↓
Parent approves
        ↓
Advisor approves
        ↓
Student becomes active member
        ↓
Advisor manages club operations
        ↓
Attendance / announcements / resources
        ↓
Badges and history
        ↓
Club completion and archive
```

V1 must successfully prove Guidr's foundation for:

- Multiple organizations
- Multiple roles
- Global identity
- Organization-specific memberships
- Multi-role users
- Parent-child relationships
- Secure permissions
- Approval workflows
- Activity management
- Scheduling
- Attendance
- Communication
- Historical records

---

# 31. Architecture Review Checklist

Before coding a major feature, answer:

## Multi-tenancy

- Does the data belong to an organization?
- Is organization access verified?

## Identity

- Is this a user identity or an organization membership?

## Permissions

- Who can view it?
- Who can create it?
- Who can edit it?
- Who can delete/archive it?

## Workflow

- What states can it have?
- Which transitions are allowed?
- Who performs each transition?

## History

- Should this record be deleted?
- Or preserved for historical reporting?

## Future scaling

- Is this shared infrastructure?
- Or specific to clubs?

## API

- What endpoint owns this action?
- Is backend validation implemented?

## Frontend

- Which roles see the feature?
- Which components can be reused?

---

# Final Founder Note

This document is the technical and product foundation for Guidr V1.

Build it as:

> A secure multi-tenant platform with a strong identity, organization, permission, and activity foundation.

Then build Clubs as the first complete vertical module.

Once Clubs are stable, Guidr can expand into the wider Student Life Management System without rebuilding its foundation.
