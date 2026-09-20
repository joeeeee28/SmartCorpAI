# SmartCorp AI — Enterprise Intelligence

**SmartCorp AI** is an Enterprise AI Intelligence Platform combining knowledge management,
permission-aware RAG, AI search, AI chat, specialized agents with routing, a decision center with
human-in-the-loop approvals, AI evaluation, RBAC, audit logs, analytics and meeting intelligence.

> **Phase 0 (current):** production-quality React frontend with a mock service layer, live and
> deployable to free HTTPS hosting. The UI talks to services — not to mock data directly — so the
> Django backend (Phase 1) plugs in without a redesign: `MOCK SERVICE → REAL DJANGO API`.

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
| Backend    | Django + DRF + PostgreSQL + pgvector + Celery + Redis (P1)    |
| Hosting    | Cloudflare Pages or GitHub Pages (free HTTPS)                 |

## 📁 Project structure

```
SmartCorpAI/
├── frontend/
│   ├── src/
│   │   ├── components/{ui,layout}/  # design system + app shell
│   │   ├── pages/                  # 25 route screens
│   │   ├── services/               # api.ts + domain services (swap point)
│   │   ├── mock/                   # realistic enterprise demo data
│   │   ├── context/                # auth, theme, toast
│   │   ├── App.tsx main.tsx        # router + entry
│   ├── public/_redirects           # SPA fallback (Cloudflare/Netlify-style)
│   └── .env.example
├── .github/workflows/deploy-pages.yml  # build + deploy to GitHub Pages
└── README.md
```

## 🚀 Local setup

**Prerequisites:** Node.js 20+.

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

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

Full `docker-compose` (frontend + backend + postgres + redis + celery) ships with **Phase 1**,
once the Django service exists. The frontend already builds into static `dist/` assets ready
for any static host or `nginx` container.

## 🔌 API (Phase 1 contract)

Planned REST surface (DRF, JWT, org-scoped):

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

- Phase 0: `tsc --noEmit` + production build gate every push (Pages workflow); route smoke tests
- Phase 1: auth/RBAC/org-isolation tests, chunking & retrieval tests, citation checks, router tests,
  approval/audit tests, security tests (cross-org denial, restricted-content containment), plus the
  full login → upload → process → ask → cite → audit e2e path

## 🌐 Deployment

**Live preview (now):** the dev server exposes free HTTPS for review during development.

**GitHub Pages (free HTTPS, auto-deploy):** a workflow (`.github/workflows/deploy-pages.yml`)
builds `frontend/` and deploys `dist/` on every push to `main`.
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
- [ ] **Phase 1** — Django + DRF + JWT + orgs/RBAC; knowledge bases & document pipeline (Celery)
- [ ] **Phase 2** — pgvector RAG with permission filtering, citations, confidence
- [ ] **Phase 3** — agent router (HR/Finance/Support), run tracing, decision engine + approvals
- [ ] **Phase 4** — eval harness, analytics events, audit hardening, docker-compose, e2e tests
