# Recruiter-Ready Production Design

**Ngày:** 2026-07-24

**Trạng thái:** Đã được chủ dự án duyệt

**Timebox:** Hoàn thành trong 1 ngày

## 1. Mục tiêu

Đưa dự án MyFuture News từ trạng thái build/test cục bộ sang một bài test có thể nộp:

- Nhà tuyển dụng chỉ cần nhấn một URL công khai để xem website.
- Không yêu cầu đăng nhập, clone repository hoặc chạy lệnh cài đặt.
- Frontend, API, PostgreSQL và Redis đều hoạt động trên free tier.
- Repository ngắn gọn, nhất quán, không chứa tài liệu nội bộ hoặc bằng chứng cũ mâu thuẫn với code.
- GitHub CI, production smoke test và checklist Go/No-Go cung cấp bằng chứng mới trước khi gửi.

Không thể đảm bảo tuyệt đối rằng hạ tầng free tier không bao giờ cold-start hoặc gặp sự cố từ nhà cung cấp. Thiết kế này giảm rủi ro bằng cache/revalidation, Redis fail-soft, health check, daily cron, smoke test và rollback.

## 2. Phạm vi

### 2.1 Trong phạm vi

- Trang tổng quan `/ban-tin`.
- Sáu trang chuyên mục, tạo thành bảy tab UI khi tính cả “Toàn cảnh”.
- Trang chi tiết bài viết.
- Redirect tương thích `/ban-tin.html` sang `/ban-tin`.
- NestJS/Fastify read API.
- PostgreSQL/Prisma migrations và dữ liệu seed.
- Redis cache-aside và fallback về PostgreSQL.
- Làm sạch cấu trúc repository, tài liệu và Git.
- Lint, unit test, API integration test, typecheck, build và CI.
- Hai Vercel deployments, Neon PostgreSQL và Upstash Redis.
- Health check, daily cron, production smoke test và rollback runbook.

### 2.2 Ngoài phạm vi

- Đăng nhập, phân quyền, admin UI hoặc CMS.
- CRUD bài viết qua giao diện.
- Queue/worker khi chưa có use case bất đồng bộ.
- Search, comments, bookmarks, analytics nghiệp vụ hoặc thanh toán.
- Clone toàn bộ các khối dự án, báo cáo, video và Pro của MyFuture.
- Kubernetes, VPS hoặc hạ tầng trả phí.
- Custom domain; bản nộp dùng URL Vercel công khai.

## 3. Kiến trúc production

```text
Recruiter browser
       |
       v
myfuture-news-web.vercel.app
Next.js, Vercel, sin1
       |
       v
myfuture-news-api.vercel.app/api
NestJS + Fastify, Vercel Function, sin1
       |                         |
       v                         v
Neon PostgreSQL             Upstash Redis
AWS Singapore               Singapore
```

Repository tạo hai Vercel Projects:

| Project | Root Directory | Vai trò |
|---|---|---|
| `myfuture-news-web` | `apps/frontend` | URL duy nhất gửi nhà tuyển dụng |
| `myfuture-news-api` | `apps/backend` | API nội bộ của demo và URL kiểm tra kỹ thuật |

Vercel Functions, Neon và Upstash cùng đặt tại Singapore. Vercel project-level region là `sin1`; Neon và Upstash dùng `ap-southeast-1`.

## 4. Cấu trúc repository mục tiêu

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   ├── src/
│   │   ├── test/
│   │   └── vercel.json
│   └── frontend/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       ├── test/
│       └── next.config.ts
├── data/
│   └── news/
│       ├── articles.json
│       └── images.json
├── docs/
│   ├── architecture/
│   ├── deployment/
│   └── superpowers/
├── infrastructure/
│   └── docker-compose.yml
├── scripts/
│   ├── verify-seed.ts
│   └── smoke-production.ts
├── .env.example
├── package-lock.json
├── package.json
└── README.md
```

Nguyên tắc:

- `apps/` chỉ chứa code chạy của frontend/backend.
- `data/news/` chứa dữ liệu đầu vào cần cho seed/test, không dùng `docs/` như runtime data store.
- `scripts/` chứa tác vụ có đầu vào/đầu ra rõ ràng.
- `docs/` chỉ giữ tài liệu kiến trúc, deploy và kế hoạch còn hiệu lực.
- File build, `.env`, secret, `NUL`, tài liệu điều phối AI và checklist lịch sử không xuất hiện trong commit nộp bài.

## 5. Dữ liệu và Prisma

### 5.1 Dữ liệu chuẩn

Production seed phải tạo:

- 6 categories.
- 30 published articles.
- 5 articles cho mỗi category.
- 5 featured articles.
- 0 category có slug/name “overview” hoặc “toàn cảnh”.
- Article slug và source URL không trùng.
- Mọi article có category, excerpt, content, author, source và image fallback hợp lệ.

“Toàn cảnh” là aggregate UI, không phải database row.

### 5.2 Kết nối

- `DATABASE_URL`: Neon pooled connection cho Prisma runtime.
- `DIRECT_URL`: Neon direct connection chỉ dùng cho migration.
- Không log hai giá trị này.
- Prisma Client là singleton theo NestJS application instance.

### 5.3 Migration và seed

- Migration files đã deploy không được sửa.
- Production migration chạy bằng `prisma migrate deploy`, không dùng `migrate dev`.
- Migration không tự chạy trong Vercel build.
- Seed chạy một lần sau migration trên Neon project mới.
- `verify-seed.ts` kiểm tra counts/invariants và trả exit code 1 nếu sai.
- Seed phải an toàn khi chạy lại với cùng dataset và không tạo duplicate.

## 6. Redis và cache

- Redis chỉ là cache, PostgreSQL là source of truth.
- Cache keys dùng namespace `news:`.
- TTL hiện có được giữ: categories 30 phút, lists 10 phút, detail 15 phút.
- Cache read/write error chỉ log cảnh báo đã loại bỏ secret; request tiếp tục đọc PostgreSQL.
- Invalid JSON cache entry được bỏ qua.
- Daily `/api/health` call chạm Redis để tránh free database không hoạt động kéo dài.
- Khi cần reset, chỉ xóa keys có prefix `news:`.

Không thêm queue vì bài test không có use case bất đồng bộ.

## 7. Frontend data delivery

- API URL chỉ đọc từ server-side `API_BASE_URL`.
- Production không được fallback im lặng về `localhost`.
- Thiếu `API_BASE_URL` trong production tạo lỗi cấu hình rõ ràng.
- Request có timeout hữu hạn và thông báo lỗi thân thiện.
- Read-only fetch dùng revalidation ngắn để giảm số lần gọi API và tác động của cold start.
- Redis vẫn là API cache; Next cache là lớp delivery cho render.
- `/ban-tin.html` redirect vĩnh viễn sang `/ban-tin`.
- Category page dùng page size 4, nhờ đó dataset 5 bài/category hiển thị pagination thật.
- Loading, empty, error, not-found và broken-image fallback tiếp tục được giữ.

## 8. Backend application lifecycle

Backend tách phần tạo application khỏi phần listen:

- `createApp()` cấu hình Fastify adapter, global prefix, ValidationPipe, exception filter và CORS.
- `bootstrap()` gọi `createApp()` rồi listen khi chạy local/traditional Node.
- API integration tests gọi `createApp()` và Fastify `inject()` mà không mở TCP port.
- Environment validation chạy trước khi khởi tạo các external clients.
- `/api/health` trả HTTP 200 cùng trạng thái:
  - `ok`: PostgreSQL và Redis đều up.
  - `degraded`: PostgreSQL up, Redis down.
  - `error`: PostgreSQL down.

Website có thể tiếp tục hoạt động ở trạng thái `degraded`; trạng thái `error` là No-Go khi nộp.

## 9. Kiểm thử và code quality

### 9.1 Quality gates

Các lệnh bắt buộc:

```bash
npm ci
npm run lint
npm run db:validate
npm run test:web
npm run test:api
npm run typecheck
npm run build
```

Không có warning/error do code dự án trong output cuối. Warning npm môi trường không làm fail nếu không xuất phát từ repository config.

### 9.2 Test scope

Frontend:

- Đúng một Overview tab cộng sáu category tabs.
- Link overview/category/detail đúng.
- Pagination tạo page 2 với current dataset.
- Markdown/HTML conversion chặn protocol nguy hiểm.
- Error, empty và image fallback components tồn tại.
- API client không dùng localhost trong production.

Backend:

- List pagination/filter/sort/featured.
- Detail/related/previous/next.
- Validation trả 400.
- Unknown category/article trả 404.
- Sanitization xảy ra trước cache.
- Cache HIT/MISS có key ổn định.
- Redis exception không làm request PostgreSQL thất bại.
- Fastify integration test xác nhận response envelope/status.

Data:

- Chính xác 6 categories và 30 articles.
- 5 articles/category và 5 featured.
- Không duplicate slug/source URL.
- Image local path tồn tại hoặc dùng fallback.

### 9.3 GitHub CI

CI chạy trên push và pull request:

1. Checkout.
2. Setup Node 20.
3. `npm ci`.
4. Lint.
5. Prisma validate/generate.
6. Web/API tests.
7. Typecheck.
8. Production builds.

CI không cần production secrets và không mutate Neon/Upstash.

## 10. Deployment configuration

### 10.1 Backend environment

```text
NODE_ENV=production
DATABASE_URL=<Neon pooled URL>
DIRECT_URL=<Neon direct URL>
REDIS_URL=<Upstash TLS Redis URL>
WEB_ORIGIN=<frontend production origin>
```

`API_PORT` chỉ dùng local; Vercel cung cấp runtime port.

### 10.2 Frontend environment

```text
NODE_ENV=production
API_BASE_URL=<backend production origin>/api
```

Không dùng `NEXT_PUBLIC_` cho database, Redis hoặc internal API base URL.

### 10.3 Vercel backend

- Root Directory: `apps/backend`.
- Region: `sin1`.
- Daily cron: `0 1 * * *` gọi `/api/health`.
- Cron chạy một lần/ngày, không được dùng như scheduler nghiệp vụ.

### 10.4 Deploy order

1. Merge commit đã pass CI.
2. Tạo Neon/Upstash tại Singapore.
3. Chạy migration, seed và seed verification.
4. Deploy backend.
5. Chạy backend smoke checks.
6. Cập nhật backend `WEB_ORIGIN` sau khi biết frontend URL.
7. Deploy frontend với `API_BASE_URL`.
8. Redeploy backend nếu CORS environment thay đổi.
9. Chạy full production smoke.
10. Ghi live demo URL thật vào README và tạo final release commit.

## 11. Production smoke test

`scripts/smoke-production.ts` nhận hai biến:

```text
WEB_BASE_URL
API_BASE_URL
```

Script kiểm tra:

- Frontend `/` redirect/hiển thị News.
- `/ban-tin` trả nội dung chính.
- Một category page trả đúng category.
- Category `?page=2` không phải lỗi server.
- Một article detail trả title/content.
- `/api/health` có `status=ok`.
- `/api/categories` có 6 rows.
- `/api/articles?page=1&limit=50` có 30 rows.
- Filter category chỉ trả category được yêu cầu.
- Unknown category/article trả 404 ở API.
- Không response nào của happy path trả 5xx.

Chạy script ba lần liên tiếp sau deploy. Cả ba lần phải exit 0.

## 12. Monitoring và vận hành

- Daily Vercel Cron gọi backend health.
- Vercel runtime logs dùng để xem lỗi trong thời gian bàn giao.
- Neon và Upstash dashboards dùng để xác nhận connection/command activity.
- README ghi ngày smoke test gần nhất.
- Trước khi gửi link, mở URL bằng cửa sổ ẩn danh trên desktop và mobile.

Daily cron không thay thế uptime SLA. Free tier phù hợp demo tuyển dụng, không được mô tả là production có SLA.

## 13. Error handling

- Frontend request timeout hoặc non-2xx ném typed error.
- API 404 gọi Next not-found UI.
- API/network 5xx hiển thị error boundary với Retry và Back to overview.
- Redis lỗi không được biến thành API 500.
- PostgreSQL lỗi được log server-side và trả response 500 không lộ connection string/stack.
- Broken article image chuyển sang committed local fallback.
- External source links dùng `noopener noreferrer`.

## 14. Security và repository hygiene

- `.env` bị ignore và chưa từng được stage trong final diff.
- Git-tracked files được scan cho private key, token và production connection string.
- Vercel/Neon/Upstash secrets chỉ nằm trong provider dashboards.
- CORS production chỉ cho frontend origin.
- Rich HTML được sanitize với allowlist trước khi cache/render.
- Không log `DATABASE_URL`, `DIRECT_URL` hoặc `REDIS_URL`.
- Không commit `.next`, `dist`, `tsbuildinfo`, coverage, logs hoặc `NUL`.
- Ảnh có source/credit; ảnh không đủ provenance dùng placeholder.

## 15. README bàn giao

README cuối cùng phải có:

1. Live Demo URL ở đầu file.
2. Một đoạn mô tả phạm vi bài test.
3. Kiến trúc ngắn gọn.
4. Tech stack.
5. Các route chính bằng slug thật.
6. Local setup từ clone tới seed/run.
7. Test/build commands.
8. Production deployment summary.
9. Environment variable names, không có values production.
10. Redis behavior/fallback.
11. Những giới hạn có chủ đích: không auth/CMS/queue.

README không giữ link bài cũ, pagination sample rỗng hoặc câu “No deployment is required”.

## 16. Rollback

- Vercel frontend/backend rollback về deployment gần nhất đã pass smoke.
- Migration production chỉ forward-compatible trong timebox này.
- Nếu migration/seed verification fail, dừng deploy frontend và sửa trước khi tiếp tục.
- Redis có thể xóa scoped keys `news:*`; không cần backup cache.
- PostgreSQL là source of truth; không reset production database sau khi URL đã gửi.

## 17. Go/No-Go

Chỉ gửi bài khi tất cả điều kiện sau đúng:

- Git status sạch.
- Không còn file `NUL`, secrets hoặc generated artifacts.
- GitHub CI xanh trên commit sẽ gửi.
- Lint, tests, typecheck và builds exit 0.
- Neon migration/seed verification exit 0.
- `/api/health` trả `ok`.
- Database đúng 6 categories, 30 published articles, 5/category và 5 featured.
- UI đúng 7 tabs.
- Category filter/pagination và article detail hoạt động.
- Redis có MISS rồi HIT; Redis failure test vẫn đọc được PostgreSQL.
- Không có console error, failed image hoặc happy-path 5xx.
- Viewports 375, 768 và 1440 px không horizontal overflow.
- Production smoke chạy ba lần liên tiếp exit 0.
- README chứa URL production thật và route examples hợp lệ.
- URL được xác nhận bằng cửa sổ ẩn danh không đăng nhập.

Nếu một điều kiện không đạt, trạng thái là No-Go và chưa gửi link.

## 18. Thứ tự ưu tiên trong timebox 1 ngày

1. Sửa inconsistency có thể làm reviewer thấy lỗi.
2. Thêm quality gates và integration/smoke coverage.
3. Deploy database/cache/backend/frontend.
4. Chạy production verification.
5. Làm sạch tài liệu và hoàn thiện README.
6. Chỉ làm polish ngoài danh sách này khi toàn bộ Go/No-Go đã pass.
