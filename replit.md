# Guidr Education Hub MVP

A centralized digital platform empowering high school students across Egypt's 27 Governorates with personalized opportunity discovery, academic pathway guidance, and an interactive RAG AI Tutor.

---

## 🚀 Run & Operate

### Environment Variables
Set the following variables in `.env` or system environment:
- `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://guidr:guidr@localhost:5434/guidr`)
- `PORT`: API server port (default: `8080` or `5000`)
- `VITE_DEV_PORT`: Frontend Vite dev port (default: `3000`)
- `GROQ_API_KEY`: Optional Groq API key for live LLM responses (`llama-3.3-70b-versatile`)

### Commands
- `pnpm --filter @workspace/db run push` — Push Drizzle database schema to PostgreSQL
- `pnpm --filter @workspace/scripts run seed` — Seed initial Admin, Student, Opportunities & Lessons
- `pnpm --filter @workspace/api-server run dev` — Run Express backend API server
- `pnpm --filter @workspace/mockup-sandbox run dev` — Run Vite frontend application
- `pnpm run typecheck` — Full workspace typecheck across all packages
- `pnpm run build` — Build production bundles for backend and frontend packages

### 🔑 Demo Accounts (After Running Seed)
- **Student Portal**: `student@guidred.org` / `StudentPass123!`
- **Admin Portal**: `admin@guidred.org` / `AdminPass123!`

---

## 🏗️ Architecture & Project Structure

- `lib/db`: Drizzle ORM PostgreSQL schema for 9 tables (`users`, `student_profiles`, `admin_profiles`, `opportunities`, `saved_opportunities`, `lessons`, `lesson_chunks`, `lesson_progress`, `chat_messages`).
- `lib/api-spec`: OpenAPI 3.1 contract (`openapi.yaml`) + Orval client hook generator.
- `artifacts/api-server`: Express 5 REST API backend with HTTP-only cookie auth, bcrypt password security, role guards, and RAG AI Tutor engine (`src/lib/ai/rag.ts`).
- `artifacts/mockup-sandbox`: React 19 + Vite frontend application with AuthContext session state, 27 Egyptian Governorates, 8 MVP categories, Student Portal, and Admin Portal.

---

## 🔒 Security & Access Rules

1. **Authentication**: Cookie session handling (`sid` cookie) with `bcryptjs` password hashing.
2. **Student Access**: Can browse active opportunities, save/unsave items, complete published lessons, and interact with the AI Tutor. Access to locked or draft lessons returns HTTP 403 Forbidden.
3. **Admin Access**: Can manage opportunity catalog, soft-delete (archive) opportunities, order & publish curriculum lessons, and edit account credentials. Access to student endpoints redirects or enforces role guards.
