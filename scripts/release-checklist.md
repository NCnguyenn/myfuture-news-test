# Release checklist (MyFuture News)

Run from a machine with a working shell, Node 22, and network access.

## 1. Local quality gates

```bash
git status --short
git branch --show-current
git log --oneline --decorate -10
git fetch --all --prune
git rev-list --left-right --count origin/codex/frontend-editorial-ui...HEAD
git diff --check
npm run check
```

## 2. Push branch (no force, no main merge)

```bash
git push -u origin HEAD
```

Confirm CI green on the PR/branch (`Node 20` + `Node 22` jobs).

## 3. Deploy order

1. Backend Vercel project `myfuture-news-api` from this branch/commit.
2. Verify:
   - `GET /api/health` → postgres up
   - `GET /api/articles?q=bat%20dong%20san` → **200** (not `property q should not exist`)
3. Frontend Vercel project `myfuture-news-web` from the **same** commit.
4. Verify:
   - `GET /api/news-search?q=hung%20yen` → JSON 200
   - `GET /ban-tin/tim-kiem?q=hung%20yen` → search page chrome, not article 404

## 4. Production smoke

```bash
# PowerShell example
$env:WEB_BASE_URL="https://myfuture-news-web.vercel.app"
$env:API_BASE_URL="https://myfuture-news-api.vercel.app/api"
npm run smoke:production
```

## 5. Cache after seed

Seed already clears `news:*` when `REDIS_URL` is set. Manual:

```bash
$env:REDIS_URL="rediss://..."   # production Upstash URL
npm run cache:clear:news
```

## 6. Do not merge main until

- Local `npm run check` green
- GitHub CI green
- Production smoke green including search
- Explicit user confirmation to merge
