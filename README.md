# SmartCorp AI — Enterprise Intelligence

**SmartCorp AI** is an Enterprise AI Intelligence Platform combining knowledge management,
permission-aware RAG, AI search, AI chat, specialized agents with routing, a decision center with
human-in-the-loop approvals, AI evaluation, RBAC, audit logs, analytics and meeting intelligence.

> **Phase 1 (current):** Django backend live — JWT auth, organizations, RBAC, Knowledge Hub with
> real upload → extract → chunk pipeline on PostgreSQL + pgvector. The frontend runs in
> **mock mode** (`VITE_USE_MOCK=true`, default) or **real mode** (`VITE_USE_MOCK=false`)
> against the API with zero UI redesign: `MOCK SERVICE → REAL DJANGO API`.

---

## ✨ Features (Phase 0)

- **Dashboard** — KPIs, AI query trend (daily/weekly/monthly), agent-usage donut, notifications,
  recent activity, quick access, system status
- **Knowledge Hub** — knowledge bases, create/search/filter, upload with simulated pipeline
- **Documents** — status/type filtering, pagination, processing states (`UPLOADING → PROCESSING → READY / FAILED`)
- **Document details** — version, permissions, pages/chunks, embedding status, processing history
- **RAG Search** — cited answers, evidence cards, retrieval-pipeline trace, confidence, feedback
- **AI Chat** — conversations, auto-routing across agents, citations, confidence, copy/regenerate/feedback
- **Agents (HR / Finance / Support)** — shared RAG infrastructure, instructions, tools, KB allow-lists,
  execution settings, run history, run console
- **Decision Center** — issue → evidence → analysis → recommendation → risk → approval → action → audit
- **Approval Center** — pending/approved/rejected queues, evidence review, comments, approve/reject
- **Evaluation** — retrieval quality, relevance, faithfulness, citation accuracy, latency, failure cases
  (clearly labeled **demo metrics**)
- **Analytics** — usage, answer funnel, agent success, token/cost trends, unanswered questions
- **Ask Data + Reports** — governed NL data questions, scheduled report exports
- **Tasks & Requests** — kanban workflow board, request intake with triage
- **Users / Roles / Departments / Audit Logs / Settings** — RBAC UI, immutable audit trail, preferences
- **UX system** — loading/skeleton/empty/error states, toasts, modals, drawers, tabs, tables,
  pagination, dark mode, responsive layout

## 🧱 Architecture

```
React (Vite + TS + Tailwind)          Phase 1 →  Django REST API
  Pages ──▶ Services ──▶ Mock data               Services ──▶ /api/* ──▶ PostgreSQL + pgvector
              ▲                                                            │
         swap point:                                            RAG → Agents → Decisions
         VITE_USE_MOCK=false                                    → Approvals → Audit/Analytics
```

**Mock → real contract:** every page calls `src/services/*`, which today returns `src/mock/*`
with simulated latency. The backend must implement the endpoints in `docs/API.md`-style paths
(`/api/knowledge-bases/`, `/api/documents/`, `/api/chat/`, `/api/rag/`, `/api/agents/`,
`/api/decisions/`, `/api/approvals/`, …) and the UI stays unchanged.

## 🛠 Technology stack

| Layer      | Choice                                                        |
|------------|---------------------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6  |
| Charts     | Recharts                                                      |
| Icons      | Lucide                                                        |
| Backend    | Django 5 + DRF + SimpleJWT + PostgreSQL 16 + pgvector + Celery + Redis |
| Hosting    | Cloudflare Pages or GitHub Pages (free HTTPS)                 |

## 📁 Project structure

```
SmartCorpAI/
├── frontend/
│   ├── src/
│   │   ├── components/{ui,layout}/  # design system + app shell
│   │   ├── pages/                  # 25 route screens
│   │   ├── services/               # api.ts + domain services (mock/real swap point)
│   │   ├── mock/                   # realistic enterprise demo data
│   │   ├── context/                # auth (JWT+refresh), theme, toast
│   │   ├── App.tsx main.tsx        # router + entry
│   ├── public/_redirects           # SPA fallback (Cloudflare/Netlify-style)
│   ├── Dockerfile nginx.conf       # compose: nginx static hosting
│   └── .env.example
├── backend/
│   ├── config/      # settings, urls, celery app
│   ├── accounts/    # User, Role, JWT auth APIs
│   ├── organizations/  # Organization, Department
│   ├── knowledge/   # KnowledgeBase, Document, DocumentChunk + pipeline + tasks
│   ├── audit/       # append-only AuditLog + helper
│   ├── rag agents workflows evaluations analytics/  # reserved for later phases
│   ├── tests/       # auth, RBAC, isolation, knowledge suites
│   ├── requirements.txt  Dockerfile  .env.example
│   └── manage.py
├── docker-compose.yml  # frontend + backend + postgres(pgvector) + redis + celery
├── .github/workflows/deploy-pages.yml  # build + deploy frontend to GitHub Pages
├── docs/CLOUDFLARE.md  # permanent HTTPS: the one manual step
└── README.md
```

## 🚀 Local setup

**Prerequisites:** Node.js 20+, Python 3.11+.

### Option A — full stack with Docker (recommended)

```bash
docker compose up --build
# frontend http://localhost:8080 · API http://localhost:8000/api/health/
```

### Option B — manual dev (mock frontend only)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173 (mock data, no backend needed)
```

### Option C — manual dev (real API mode)

```bash
# 1. Postgres 16 + pgvector extension + Redis (see docker-compose for versions)
# 2. backend
cd backend
python -m venv ../backend-venv && ../backend-venv/bin/pip install -r requirements.txt
cp .env.example .env   # then set DATABASE_URL / REDIS_URL
../backend-venv/bin/python manage.py migrate
../backend-venv/bin/python manage.py seed_demo   # dev-only demo org + users
../backend-venv/bin/python manage.py runserver   # http://localhost:8000
# 3. frontend (real mode)
cd ../frontend
VITE_USE_MOCK=false VITE_API_URL=http://localhost:8000/api npm run dev
```

Demo credentials (seeded): `admin@smartcorp.ai / Admin123!`
(Mock mode: any credentials work.)

| Script            | Purpose                              |
|-------------------|--------------------------------------|
| `npm run dev`     | dev server (HMR)                     |
| `npm run build`   | typecheck + production build → `dist/` |
| `npm run preview` | serve the production build locally   |

Demo login: any credentials work (pre-filled `admin@smartcorp.ai`). Auth state persists in
`localStorage` until the real JWT backend lands.

## 🔧 Environment variables

See `frontend/.env.example`. Key knobs:

| Variable         | Default                    | Meaning                                    |
|------------------|----------------------------|--------------------------------------------|
| `VITE_API_URL`   | `http://localhost:8000/api`| Django API base (Phase 1)                 |
| `VITE_USE_MOCK`  | `true`                     | `false` = services call the real API       |
| `VITE_BASE`      | `/`                        | sub-path hosting base (e.g. `/SmartCorpAI/`) |

## 🐳 Docker

`docker-compose.yml` runs the full stack: **frontend** (nginx static) + **backend** (gunicorn) +
**postgres** (`pgvector/pgvector:pg16`) + **redis** + **celery worker**:

```bash
docker compose up --build
```

Celery runs inline (`CELERY_EAGER=True`) in dev/tests so no worker is required; compose sets
`CELERY_EAGER=False` so uploads process asynchronously via Redis + the worker.

## 🔌 API

Implemented REST surface (DRF, JWT, org-scoped). Auth: `Authorization: Bearer <access>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register/` | Create org + first Admin, returns JWT pair |
| POST | `/api/auth/login/` | Login, returns JWT pair (org_id + role claims) |
| POST | `/api/auth/refresh/` | Rotate refresh token |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET | `/api/auth/me/` | Current user + org + role + permissions |
| GET/PATCH | `/api/users/`, `/api/users/{id}/` | Org users (role changes: Admin) |
| GET/PATCH | `/api/organization/` | Own org (update: Admin) |
| CRUD | `/api/departments/` | Org departments (writes: Admin) |
| CRUD | `/api/knowledge-bases/` | Visibility-filtered (writes: Admin for update/delete) |
| GET/POST/DELETE | `/api/documents/` | Multipart upload → real pipeline; role-filtered |
| POST | `/api/documents/{id}/process/` | Reprocess (uploader or Admin) |
| GET | `/api/audit-logs/` | Org audit trail (Admin) |

Planned next (chat/RAG/agents/decisions/approvals):

```
/api/auth/  /api/organizations/  /api/users/  /api/knowledge-bases/
/api/documents/  /api/documents/{id}/process/  /api/chat/  /api/rag/
/api/agents/  /api/agents/{id}/run/  /api/decisions/  /api/approvals/
/api/tasks/  /api/evaluations/  /api/analytics/  /api/audit-logs/
```

## 🧠 RAG architecture (target)

```
Question → normalize → semantic + keyword search → merge → rerank
       → PERMISSION FILTER (before the LLM) → context → LLM
       → answer + citations + confidence → audit log
```

One shared index and router serve all three agents; agents differ only in instructions, tools
and allowed knowledge bases. Frontend already models this (`routeQuery()` in
`services/agentService.ts`, pipeline trace on the RAG Search page).

## 🔒 Security model

- Organization isolation on every object (enforced in Phase 1 backend)
- RBAC: Admin / HR / Finance / Support / Employee (UI + API + retrieval layers)
- Permission filtering **before** restricted content reaches the LLM
- JWT auth, short-lived; API keys never in frontend code
- Append-only, hash-chained audit logs; denied accesses logged
- `.env` never committed; demo uses zero secrets

## 🧪 Testing

- Frontend: `npm run build` (`tsc --noEmit` + vite build) gates every push; 24 routes smoke-tested.
- Backend: `python manage.py test` — **21 tests, all passing on real PostgreSQL + pgvector**:
  auth (register/login/refresh/logout/401s), RBAC (visibility, role-restricted docs, admin-only
  writes), organization isolation (cross-org reads return 404, no existence leaks), knowledge
  (real TXT/CSV upload → READY + chunks, validation errors, honest FAILED on corrupt PDF,
  reprocess, delete, audit records), pipeline unit tests (clean/chunk).
- Service e2e: the shipped TS services execute against the live API —
  **11/11 real-mode checks** (register→login→restore→KB→upload→detail→users→audit→logout)
  and **6/6 mock-mode checks** pass.
- Coming with RAG: retrieval/citation/router/approval tests + the full
  login → upload → process → ask → cite → audit path.

## 🌐 Deployment

**Live preview (now):** the dev server exposes free HTTPS for review during development.

**Cloudflare Pages is preferred — see `docs/CLOUDFLARE.md` for the exact one-step setup.**

**GitHub Pages (free HTTPS, auto-deploy)** is pre-wired as the fallback:
a workflow (`.github/workflows/deploy-pages.yml`) builds `frontend/` and deploys `dist/`
on every push to `main`.
One-time setup (requires repo admin — the automation token cannot do this step):

1. GitHub → repository **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push/merge to `main` → live at `https://<owner>.github.io/SmartCorpAI/`

**Cloudflare Pages (preferred free HTTPS):**

1. Cloudflare Dashboard → Pages → Connect repo `SmartCorpAI`
2. Root directory `frontend` · build `npm run build` · output `dist`
3. `public/_redirects` already provides SPA fallback → `https://smartcorp-ai.pages.dev`
   (or nearest available name). Every push auto-redeploys with previews per branch.

## 🗺 Roadmap

- [x] **Phase 0** — frontend, mock services, routing, design system, HTTPS deploy wiring
- [x] **Phase 1** — Django + DRF + JWT + orgs/RBAC; knowledge bases & real document pipeline
  (Celery eager in dev, worker in compose); pgvector schema + HNSW index (embeddings Phase 2)
- [ ] **Phase 2** — pgvector RAG with permission filtering, citations, confidence
- [ ] **Phase 3** — agent router (HR/Finance/Support), run tracing, decision engine + approvals
- [ ] **Phase 4** — eval harness, analytics events, audit hardening, docker-compose, e2e tests
