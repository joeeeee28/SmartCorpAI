# Permanent free HTTPS — Cloudflare Pages setup

The automation sandbox has no Cloudflare credentials, so project creation needs
**exactly one manual action** (about 2 minutes). Everything else is already wired.

## The ONE manual action

1. Open **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**
2. Select repository **`joeeeee28/SmartCorpAI`**, branch **`main`** (after PR #1 is merged)
3. Use these **exact build settings**:

| Setting               | Value              |
|-----------------------|--------------------|
| Framework preset      | `None` (or Vite)   |
| Root directory        | `frontend`         |
| Build command         | `npm run build`    |
| Build output directory| `dist`             |
| Project name          | `smartcorp-ai` → `https://smartcorp-ai.pages.dev` (or nearest available) |

4. Environment variables (Pages → Settings → Environment variables → Production):

| Variable         | Value (until backend is hosted) |
|------------------|---------------------------------|
| `VITE_USE_MOCK`  | `true`                          |
| `VITE_API_URL`   | `http://localhost:8000/api` (unused while mock; update when the API is hosted) |

5. **Save and Deploy.** Every later push to `main` auto-redeploys; every PR gets a preview URL.

## Already prepared in this repo

- `frontend/public/_redirects` — `/* /index.html 200` SPA fallback, so direct navigation to
  `/dashboard`, `/knowledge`, `/agents`, `/approvals` and refresh never 404.
- `vite.config.ts` — `base '/'` (domain-root hosting), production build verified in CI.
- Production build gate: `npm run build` (`tsc --noEmit && vite build`) passes.
- No secrets in the bundle: the frontend only ever holds short-lived JWTs / mock data.

## Post-deploy verification checklist

- [ ] `https://smartcorp-ai.pages.dev/login` loads, demo sign-in works
- [ ] Direct open of `/dashboard`, `/knowledge`, `/agents`, `/approvals` (no 404)
- [ ] Refresh on a deep route keeps the page (no 404)
- [ ] Static assets load (no unstyled page / missing JS)
- [ ] Push a commit → Pages rebuilds automatically

## Alternative (also one click)

GitHub → repository **Settings → Pages → Source: GitHub Actions** enables the included
`deploy-pages.yml` workflow → `https://joeeeee28.github.io/SmartCorpAI/`.
Both can stay configured; Cloudflare remains the preferred URL.
