Current baseline

**Already in place**

- DB schema (all 9 tables)
- Seed script (admin, student, opportunities, lessons)
- Auth API (signup, login, logout, me) with cookies + bcrypt
- Role middleware on backend routes
- Full OpenAPI spec + generated clients
- Most Express routes implemented
- Partial frontend API calls on: login, signup, opportunities list/save, saved, tutor list, lesson + chat, admin opportunities/lessons/settings

**Not MVP-ready yet**

- Local DB push/seed may not be run
- Frontend still mockup-first (dashboard, profile, detail pages, shells)
- No route guards or auth-aware layout
- RAG is keyword-based (no embeddings/pgvector)
- Business rules incomplete (locked lessons, archive-only, validation)
- No tests, no real deployment/docs

---

## Phase 0 — Make it runnable (1 day)

Do this first or nothing else matters.

### Tasks

1. Set env vars:
   - `DATABASE_URL`
   - `GROQ_API_KEY` (optional for MVP; fallback exists)
   - `NODE_ENV=development`
2. Push schema + seed:

   pnpm --filter @workspace/db run push

   pnpm --filter @workspace/scripts run seed
3. Run both services:

   pnpm --filter @workspace/api-server run dev   *# port 8080*

   pnpm --filter @workspace/mockup-sandbox run dev
4. Add Vite dev proxy so `/api` hits the API server locally (Replit does this automatically; local dev needs it).

### Done when

- `GET /api/healthz` returns OK
- Student can log in with seeded account
- At least one screen (e.g. opportunities) loads real DB data

---

## Phase 1 — App shell & auth (2–3 days)

Turn mockup pages into a real authenticated app.

### 1.1 Route guards

Create a `ProtectedRoute` wrapper using `useAuth()`:

| **Route groupRule**                         |                              |
| ------------------------------------------- | ---------------------------- |
| `/guidr/login`, `/guidr/signup`, landing    | Public                       |
| `/guidr/*` (dashboard, opportunities, etc.) | Require `role === "student"` |
| `/guidr-admin/*`                            | Require `role === "admin"`   |

Redirect unauthenticated users to login; redirect wrong role to correct portal.

### 1.2 Auth-aware layout

Replace hardcoded user info in `Shell` and `AdminShell`:

- Name, grade, governorate from `user.studentProfile`
- Admin name from `user.adminProfile`
- Logout button wired to `useAuth().logout()`

### 1.3 Centralize navigation

Ensure all internal links use the shared router (`Link`, `useLocation`) and every MVP screen is registered in `App.tsx`:

- Add missing route: **`/guidr/OpportunityDetail?id=...`**

### Done when

- Opening `/guidr/Dashboard` while logged out → redirects to login
- Admin cannot open student pages (and vice versa)
- Sidebar shows the logged-in user’s real profile

---

## Phase 2 — Finish student flows (3–4 days)

Wire every student screen to the API.

### 2.1 Dashboard (`Dashboard.tsx`)

Replace mock `opportunities` from `_shared` with:

- Saved opportunities: `GET /api/opportunities/saved` (top 3)
- Recommended/filtered: `GET /api/opportunities?category=...&governorate=...&grade=...` using profile interests
- Tutor progress: `GET /api/lessons` → show next incomplete published lesson

### 2.2 Profile (`Profile.tsx`)

Wire to:

- `GET /api/student/profile`
- `PUT /api/student/profile`

Fields aligned with MVP:

- first/last name, phone, school, governorate (27 options), grade (9–12), interests (MVP categories)

Remove fake country/city fields unless you want them in scope.

### 2.3 Opportunity detail (`OpportunityDetail.tsx`)

- Route in `App.tsx`
- Load `GET /api/opportunities/:id`
- Show full MVP fields: eligibility, timeline, application process, link
- Save/unsave via `POST/DELETE /api/opportunities/:id/save`
- Link from opportunities list cards (“View details”)

### 2.4 Opportunities list polish

- Navigate to detail page instead of inline-only view
- Show `isSaved` state consistently
- Empty/error states

### Done when

Full student journey works: **Signup → Dashboard → Browse → Detail → Save → Saved list → Tutor → Lesson + chat → Edit profile**

---

## Phase 3 — Finish admin flows (2 days)

### 3.1 Admin dashboard (`guidr-admin/Dashboard.tsx`)

Replace static `recentActivity` with real counts:

- Total active/draft/archived opportunities
- Published/draft/locked lessons
- Optional: recent items from DB (`ORDER BY updated_at DESC LIMIT 5`)

### 3.2 Opportunities admin

Verify create/edit form includes all MVP fields:

- categories (8 MVP categories), types, eligibility, timeline, application link, status
- Status actions: draft → active → archived
- **Remove hard delete**; use archive only (change `DELETE` to set `status: archived` or remove delete button)

### 3.3 Lessons admin

- Keep textarea for MVP (rich editor is nice-to-have, not blocking)
- Confirm create/update triggers chunk re-index
- Reorder + publish/draft/lock all working

### 3.4 Settings

Already mostly done — verify password change updates seed/mock fallback behavior.

### Done when

Admin can manage full content lifecycle without touching the DB manually.

---

## Phase 4 — Backend hardening (2–3 days)

Close gaps between “routes exist” and “MVP rules enforced.”

### 4.1 Lesson access rules

Update `GET /lessons` and `GET /lessons/:id`:

| **StatusStudent behavior** |                                             |
| -------------------------- | ------------------------------------------- |
| `published`                | Full access                                 |
| `locked`                   | Visible in list, **content + chat blocked** |
| `draft`                    | Hidden from students                        |

Enforce same rules on:

- `POST /lessons/:id/chat`
- `POST /lessons/:id/progress`

### 4.2 Opportunity rules

- Students: only `active` (already done)
- Admins: archive instead of delete
- Validate categories against MVP list server-side

### 4.3 Input validation

Use `@workspace/api-zod` schemas on all POST/PUT/PATCH bodies:

- auth signup/login
- student profile update
- opportunity create/update
- lesson create/update
- chat message

Return consistent `{ message }` errors.

### 4.4 Seed passwords

Replace mock hash fallback in auth with real bcrypt hashes in seed:

passwordHash: await bcrypt.hash("AdminPass123!", 10)

Document demo credentials in `replit.md`.

### Done when

- Direct URL to locked lesson returns 403 or “locked” UI
- Invalid payloads rejected with 400
- No accidental hard deletes

---

## Phase 5 — RAG & AI tutor (2–3 days)

MVP can ship with keyword retrieval + Groq, but the spec calls for real RAG.

### Minimum viable (ship faster)

Keep current keyword chunk retrieval + Groq; ensure:

- Chunks always exist after lesson save
- Chat scoped to current lesson only
- Fallback message when `GROQ_API_KEY` missing

### Full RAG (spec-aligned)

1. Enable `pgvector` extension in Postgres
2. On `indexLessonContent()`:
   - Chunk text (already done)
   - Call embedding API (Groq/OpenAI/etc.)
   - Store in `lesson_chunks.embedding`
3. On chat:
   - Embed user question
   - Vector similarity search scoped to `lesson_id`
   - Top 3 chunks → Groq prompt
4. Re-index on lesson update

### Done when

Asking a question about a specific lesson returns answers grounded in that lesson’s content, not generic text.

---

## Phase 6 — Frontend quality (2 days)

### 6.1 Data layer (optional but recommended)

Replace scattered `fetch` with generated React Query hooks from `@workspace/api-client-react`:

- Centralized loading/error handling
- Cache invalidation after mutations (save, profile update, lesson progress)

### 6.2 UX essentials

- Loading skeletons on all data pages
- Error toasts (sonner already in project)
- Form validation (client mirrors server rules)
- Chat: sending indicator, error on failed message
- Pagination on opportunities if list grows (can defer if seed stays small)

### Done when

App feels responsive and failures are visible, not silent.

---

## Phase 7 — Deploy & validate (2 days)

### 7.1 Environment

Production env checklist:

- `DATABASE_URL`
- `GROQ_API_KEY`
- Cookie/security settings (httpOnly already set)
- CORS for production frontend origin

### 7.2 Deploy

Use existing Replit artifacts:

- API artifact → `/api` on port 8080
- Frontend artifact → student/admin routes

On deploy: run `db push` + `seed`.

### 7.3 Smoke test checklist

| **FlowPass**                           |   |
| -------------------------------------- | - |
| Student signup (3 steps)               | ☐ |
| Student login/logout                   | ☐ |
| Browse/filter opportunities            | ☐ |
| View detail + save/unsave              | ☐ |
| Saved list persists                    | ☐ |
| Tutor lesson list + progress           | ☐ |
| AI chat returns lesson-grounded answer | ☐ |
| Admin login                            | ☐ |
| Create/edit/archive opportunity        | ☐ |
| Create/edit/reorder/publish lesson     | ☐ |
| Admin settings password change         | ☐ |
| Student cannot hit admin APIs (403)    | ☐ |

### 7.4 Documentation

Fill in `replit.md`:

- What Guidr is
- Run commands
- Env vars
- Demo accounts
- Architecture (DB, auth, RAG flow)

---

## Suggested execution order

Phase 0: Runnable locallyPhase 1: Auth shell + guardsPhase 2: Student screensPhase 3: Admin screensPhase 4: Backend rulesPhase 5: RAG/AIPhase 6: UX polishPhase 7: Deploy + test

**Critical path:** Phase 0 → 1 → 2 → 4 → 7
**Can parallelize:** Phase 3 while doing Phase 2; Phase 5 after Phase 4; Phase 6 alongside late Phase 2/3

---

## MVP scope cuts (if you need to ship faster)

Keep:

- All student + admin CRUD flows
- Cookie auth + route guards
- Keyword RAG + Groq (skip pgvector for v1)
- Textarea lesson editor (skip rich editor)

Defer:

- Pagination
- React Query migration (keep fetch)
- Streaming chat responses
- Automated test suite (manual smoke tests only)
- Rich text editors

---

## Rough timeline

| **ScopeTime**                            |               |
| ---------------------------------------- | ------------- |
| Fast MVP (keyword RAG, manual tests)     | **\~2 weeks** |
| Full spec MVP (vector RAG, polish, docs) | **\~3 weeks** |

---

## Definition of “complete MVP”

The MVP is done when:

1. A new student can **sign up, browse active opportunities, save them, complete tutor lessons, and chat with the AI** — all persisted in Postgres.
2. An admin can **create/manage opportunities and lessons, publish content, and update settings** — without DB access.
3. **Auth and roles are enforced** on both frontend routes and backend APIs.
4. The app **runs deployed** with documented env setup and passes the smoke test checklist.