# MyFuture News — recruiter release checklist

Evidence date: 2026-07-26
Branch under review: `codex/recruiter-readiness-remediation`
Scope: recruiter remediation, release integration, and read-only production verification. Production seed/data mutation and secret disclosure remain prohibited.

## 1. Repository and identity

| Check | Expected | Result |
|---|---|---|
| `git status --short --branch` | Reviewed branch and only intended local changes | PASS — branch is `codex/recruiter-readiness-remediation`; Tasks 1–3 changes plus this checklist are present |
| `git diff --check` | No whitespace errors | PASS — only CRLF normalization warnings |
| `git ls-remote origin refs/heads/main` | Reviewed pre-remediation base SHA | `0d1f368288c9dbf611d991b8dad8909e140b52d6` |
| `git rev-parse origin/main` | Same reviewed base before integration | `0d1f368288c9dbf611d991b8dad8909e140b52d6` |
| `git rev-parse HEAD` | Known reviewed branch base SHA | `0d1f368288c9dbf611d991b8dad8909e140b52d6` |
| Tracked environment files | `.env` absent; placeholders only if documented | PASS — only `.env.example` is tracked |
| Secret scan | No live credentials or private keys | PASS — matches are local placeholder/documentation examples only |

Vercel deployment identity is a post-merge gate recorded in the final release handoff rather than embedded here, because a commit cannot contain its own final SHA. Confirm the following without copying values into the repository:

| Project | Required production evidence |
|---|---|
| `myfuture-news-web` | `Ready`, production alias `myfuture-news-web.vercel.app`, branch, full deployment SHA, timestamp, `API_BASE_URL` points to `https://myfuture-news-api.vercel.app/api`, and no localhost value |
| `myfuture-news-api` | `Ready`, production alias `myfuture-news-api.vercel.app`, branch, full deployment SHA, timestamp, Production variable names `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `WEB_ORIGIN`, `NODE_ENV`, with `WEB_ORIGIN` set to `https://myfuture-news-web.vercel.app` and no localhost value |

Do not infer a Vercel deployment SHA from `X-Vercel-Id`, response headers, or the local Git SHA.

## 2. Local quality gates

Run from the repository root:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run lint
npm.cmd run db:validate
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check
```

Expected and observed on 2026-07-26:

| Gate | Result |
|---|---|
| Root `npm.cmd test` | PASS — frontend 99/99, backend 67/67, failed 0, skipped 0 |
| `npm.cmd run lint` | PASS — 0 errors, 0 warnings |
| `npm.cmd run db:validate` | PASS |
| `npm.cmd run typecheck` | PASS — frontend and backend |
| `npm.cmd run build` | PASS — Next.js and NestJS |
| `npm.cmd run check` | PASS — full combined gate |

The focused CI-source commands for the source contracts are:

```powershell
node --require ts-node/register/transpile-only --test --test-name-pattern "root npm test" apps/backend/test/ci-source.spec.ts
node --require ts-node/register/transpile-only --test --test-name-pattern "official Next.js rules" apps/backend/test/ci-source.spec.ts
```

Do not use `npm.cmd run test:api -- --test-name-pattern "..."`; nested npm consumes that argument.

## 3. Production API/web smoke

```powershell
$env:WEB_BASE_URL="https://myfuture-news-web.vercel.app"
$env:API_BASE_URL="https://myfuture-news-api.vercel.app/api"
npm.cmd run smoke:production
```

Observed result:

```json
{"status":"ok","categories":6,"articles":42,"category":"quy-hoach-ha-tang","article":"hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong","searchAccentHits":20,"searchPlainHits":20,"searchHungYenHits":36,"bffHits":6}
```

Critical endpoint evidence:

| Endpoint | Expected | Result |
|---|---|---|
| `GET /api/health` | 200; api/postgres/redis up | PASS |
| `GET /api/categories` | 200; 6 categories | PASS |
| `GET /api/articles?page=1&limit=4` | 200; 4 items | PASS |
| `GET /api/articles?page=2&limit=4` | 200; 4 items | PASS |
| `GET /api/articles?category=phap-ly-du-an&page=2&limit=4` | 200; real page-two data | PASS; 3 items |
| Accent/plain article search | 200; equivalent positive results | PASS; 5 each |
| `GET /api/articles?q=a` | 400 validation envelope | PASS |
| `GET /api/articles/missing-article` | 404 `ARTICLE_NOT_FOUND` | PASS |
| `GET /api/news-search?q=hung%20yen&limit=5` | 200 JSON | PASS; 5 items, 36 total |
| `/ban-tin`, page 2, category, category page 2 | 200 HTML with real content | PASS |
| `/ban-tin/tim-kiem?q=hung%20yen` | 200 HTML with visible search results | PASS; 36 hits |
| `/ban-tin.html` | 308 redirect to `/ban-tin` | PASS |

## 4. Browser and responsive matrix

Chrome 150 headless/CDP evidence was captured outside the repository at:

- `C:\tmp\myfuture-news-browser-audit-fresh-2026-07-26T08-36-11-186Z\overview-1440.png`
- `C:\tmp\myfuture-news-browser-audit-fresh-2026-07-26T08-36-11-186Z\category-page2-1280.png`
- `C:\tmp\myfuture-news-browser-audit-fresh-2026-07-26T08-36-11-186Z\search-plain-768.png`
- `C:\tmp\myfuture-news-browser-audit-fresh-2026-07-26T08-36-11-186Z\article-390.png`

The matrix covered all nine required routes at 1440, 1280, 768, and 390 pixels (36 combinations):

| Evidence | Expected | Result |
|---|---|---|
| `document.documentElement.scrollWidth > document.documentElement.clientWidth` | `false` | PASS — all 36 combinations |
| Header, main, nav, footer | Present and usable | PASS |
| Images | No broken images; every image has non-empty `alt` | PASS — 0 missing alt |
| Vietnamese text | No visible mojibake or clipping | PASS |
| Console/runtime | No severe error or hydration error | PASS — 0 |
| Network | No non-cancelled failures, HTTP >=400 subresources, or localhost requests | PASS |
| Desktop/sidebar and mobile collapse | No cover/overlap; intentional category-tab horizontal track only | PASS |
| Search routes | Accented and unaccented queries render result links | PASS |
| Category navigation | Clicking a category tab changes to its canonical route | PASS |
| Pagination/article navigation | Clicking page 2 and an article opens the expected canonical route | PASS |
| BFF network | `/api/news-search` returns HTTP 200 JSON | PASS |

Limitation: this is automated Chrome/CDP evidence, not a manually operated DevTools window with Preserve log. A human release reviewer may repeat the four screenshots and inspect the visible Console/Network panels.

## 5. Web 404 decision

Read-only verification on 2026-07-26:

- `GET https://myfuture-news-web.vercel.app/ban-tin/khong-ton-tai` returns streamed HTTP 200.
- Browser DOM shows the professional “Không tìm thấy bài viết” UI and `meta[name="robots"]` with `noindex`.
- No stack trace, database details, `DATABASE_URL`, `REDIS_URL`, or `PrismaClient` marker is exposed.
- `GET https://myfuture-news-api.vercel.app/api/articles/missing-article` returns HTTP 404 with code `ARTICLE_NOT_FOUND`.
- Valid articles and search never render the not-found UI in the hydrated browser flow.

Decision: accept the web HTTP 200 for the streamed App Router not-found response. Next.js may commit response headers before the not-found boundary resolves; do not disable streaming, duplicate API lookups, add middleware guesses, or use a client redirect solely to fake HTTP 404.

## 6. Release decision

Mark **GO — CÓ THỂ NỘP NGAY** only if all of the following are confirmed:

- Root tests and `npm.cmd run check` exit 0.
- Production smoke exits 0; API, PostgreSQL, and Redis are up.
- Search (accented/unaccented), article detail, category tabs, and real page-two pagination pass.
- Browser matrix passes at 1440/1280/768/390 with no severe console or hydration error.
- No visible UTF-8 corruption or tracked secrets exists.
- Web and API Vercel project status, aliases, deployment SHAs, timestamps, and environment-variable names are manually confirmed.

The final GO/NO-GO decision belongs in the release handoff after the final `origin/main` SHA, GitHub Actions checks, and Vercel deployment identity are verified.

## 7. Safety constraints

- No production seed or data mutation.
- No production secret values read, printed, or stored.
- No force-push.
- Do not infer deployment identity from response headers.
