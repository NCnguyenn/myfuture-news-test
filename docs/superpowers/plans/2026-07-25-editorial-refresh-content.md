# MyFuture News Editorial Refresh and Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, responsive MyFuture News editorial experience with 42 verified articles, preserving the existing API, PostgreSQL, Redis, CI, and production contracts.

**Architecture:** Keep `data/news` as the canonical publication dataset, validate its exact count map through one shared contract, and continue feeding it through the existing Prisma seed and NestJS API. Refine the existing Next.js server-rendered routes and focused CSS Modules instead of replacing the application structure. Merge and seed production only after isolated implementation, per-task review, preview verification, and explicit user visual approval.

**Tech Stack:** Node.js 22, Next.js 15, React 19, NestJS 11 with Fastify, PostgreSQL, Prisma 6, Redis, TypeScript, CSS Modules, Node test runner, Vercel.

## Global Constraints

- Work only on `codex/editorial-refresh-content` until every branch gate and user visual review pass.
- Do not change the public API shape, Prisma schema, hosting providers, or Redis cache architecture.
- Do not add authentication, fake search, newsletter submission, Pro locks, CRM, booking, or other non-working controls.
- Use the approved colors: `#9F1D2D`, `#C62832`, `#172033`, `#F7F6F3`, `#FFFFFF`, `#667085`, `#FBEAEC`, and `#B88A44`.
- Use a Georgia/Cambria system serif stack for editorial headings and a Segoe UI/Helvetica/Arial system sans stack for interface and body copy.
- Keep exactly six API categories and seven navigation entries including `Toàn cảnh`.
- Finish with exactly 42 published articles and category counts `8, 8, 7, 7, 6, 6` for `thi-truong-gia-ca`, `quy-hoach-ha-tang`, `phap-ly-du-an`, `lai-suat-tai-chinh`, `dau-tu-dong-tien`, and `cho-thue`.
- Keep exactly five featured articles.
- Every new article requires a unique slug, unique canonical source URL, verified facts, evidence entries, complete author/source/image provenance, meaningful image alt text, and a locally stored optimized image.
- Never invent quotations, statistics, dates, people, organizations, projects, or source claims.
- Keep API timeout at eight seconds and keep failed responses out of successful caches.
- Keep Redis fail-soft: PostgreSQL-backed content must remain available when Redis is unavailable.
- All visible controls must navigate, paginate, retry, or otherwise work.
- Support 320px, 375px, 390px, 768px, 1024px, and 1440px without horizontal page overflow.
- Keep touch targets at least 44px high where practical, visible keyboard focus, semantic landmarks, meaningful alt text, responsive `sizes`, WCAG AA body/control contrast, and reduced-motion behavior.
- Use Node.js `22.22.0` for local verification and `npm.cmd` in PowerShell.
- Do not perform a major dependency upgrade as part of this branch.
- Do not expose credentials in Git, command output, review packages, reports, or chat.
- Use a fresh implementer for each task, a different task reviewer after each task, and a fresh whole-branch reviewer before merge.
- Do not seed production or move the production alias until the branch, preview, review, and user approval gates pass.

---

## File Responsibility Map

### Dataset and verification

- `docs/research/2026-07-25-editorial-expansion-sources.md`: the immutable research brief for the 12 additions.
- `scripts/lib/news-dataset-contract.ts`: the single exact count contract consumed by seed, loaders, smoke tests, and unit tests.
- `scripts/lib/seed-invariants.ts`: reusable database snapshot invariant checks.
- `scripts/lib/official-news-data.ts`: strict canonical JSON and local asset loader.
- `data/news/articles.json`: canonical categories and 42 complete article records.
- `data/news/images.json`: one provenance record per article slug.
- `apps/frontend/public/images/news/researched/*`: optimized, local researched images.
- `apps/frontend/lib/researched-news.ts`: deterministic preview mapping and ordering.
- `scripts/smoke-production.ts`: public deployment contract checks using the exact count map.

### Frontend frame and routes

- `apps/frontend/app/globals.css`: tokens, reset, focus, shared page primitives, typography, and reduced motion only.
- `apps/frontend/components/Header.tsx` and `Header.module.css`: brand frame and working route navigation.
- `apps/frontend/components/Footer.tsx` and `Footer.module.css`: professional footer with working internal links.
- `apps/frontend/components/NewsTabs.tsx` and `NewsTabs.module.css`: seven-entry category navigation and mobile horizontal scrolling.
- `apps/frontend/components/NewsImage.tsx`: the only responsive Next Image boundary.
- `apps/frontend/components/NewsCard.tsx` and `NewsCard.module.css`: explicit `lead`, `supporting`, `feed`, `compact`, and `related` variants.
- `apps/frontend/components/FeaturedNews.tsx` and its CSS Module: exactly one lead and two supporting stories.
- `apps/frontend/components/PopularStories.tsx` and its CSS Module: semantic numbered ranking.
- `apps/frontend/components/CategoryDirectory.tsx` and its CSS Module: working category links and counts.
- `apps/frontend/app/ban-tin/page.tsx` and its CSS Module: overview composition and latest-feed pagination.
- `apps/frontend/app/ban-tin/[category]/page.tsx` and its CSS Module: category masthead, page-one lead, feed, side panels, and pagination.
- `apps/frontend/app/ban-tin/[category]/[slug]/page.tsx` and its CSS Module: reading layout, provenance, side panels, previous/next, and related stories.
- Existing loading, error, and not-found route files: visually coherent resilient states.

---

### Task 1: Freeze the 12-article research brief

**Files:**
- Create: `docs/research/2026-07-25-editorial-expansion-sources.md`

**Interfaces:**
- Consumes: the 12 approved source candidates and the provenance requirements in the design specification.
- Produces: a numbered `MFN-31` through `MFN-42` research record for each article with category, slug, source URL, publication metadata, verified facts, direct image URL, alt text, and credit.

- [ ] **Step 1: Re-open and verify all 12 canonical pages**

Use the browser or a read-only HTTP request to confirm that every canonical URL returns the intended article, publication date, byline or publisher, and supporting text for the facts listed below. For the VnExpress lending-rate article, inspect page metadata and content until a genuine page image is found; do not manufacture or substitute an unrelated photo.

Expected: all 12 pages are reachable and every number written into the brief is supported by the corresponding page.

- [ ] **Step 2: Download and inspect the 12 source images in a temporary directory**

Store temporary downloads outside the repository, confirm that each URL returns an image MIME type, and visually inspect the files. Reject tracking pixels, logos, unrelated thumbnails, or images whose use cannot be credited to the source page.

Expected: 12 meaningful source-associated images are available before any canonical data changes.

- [ ] **Step 3: Write the research brief**

Use this exact record structure for every numbered source:

```markdown
## MFN-31 — Nguồn cung sơ cấp tăng 40% nhưng lượng hấp thụ nửa đầu năm giảm 62%

- Category: `thi-truong-gia-ca`
- Slug: `nguon-cung-so-cap-tang-40-hap-thu-giam-62-nua-dau-2026`
- Canonical URL: `https://vnexpress.net/giao-dich-bat-dong-san-giam-manh-nua-dau-nam-5097659.html`
- Publisher: `VnExpress`
- Published at: `2026-07-20T09:47:00+07:00`
- Verified facts:
  - Nguồn cung sơ cấp mới đạt 37.300 sản phẩm và tổng nguồn cung vượt 102.400 sản phẩm, tăng 40% so với cùng kỳ.
  - Lượng hấp thụ đạt khoảng 26.100 sản phẩm, giảm 62%; tỷ lệ hấp thụ phổ biến 20–30%.
  - Lãi suất vay mua nhà được bài nguồn ghi nhận ở mức 12–14%/năm.
- Image URL: `https://i2-vnexpress.vnecdn.net/2026/07/16/1784175661852bd66846f5454640dc-7227-2551-1784176607.jpg?w=1200&h=675&q=100&dpr=1&fit=crop&s=TFosauBx3Ryvn3jq2NVyhQ`
- Image alt: `Khu đô thị với nhiều khối chung cư và nhà thấp tầng`
- Credit: `Ảnh theo bài nguồn VnExpress`
```

Create the remaining records with these exact category and slug assignments:

| ID | Category | Slug | Canonical URL |
| --- | --- | --- | --- |
| MFN-32 | `thi-truong-gia-ca` | `biet-thu-lien-ke-ha-noi-thanh-khoan-giam-74-quy-2-2026` | `https://vnexpress.net/thanh-khoan-biet-thu-lien-ke-lao-doc-5100145.html` |
| MFN-33 | `thi-truong-gia-ca` | `gia-can-ho-neo-cao-nguoi-mua-chon-loc-2026` | `https://tapchixaydung.vn/thi-truong-bat-dong-san-gia-nha-chua-ha-nguoi-mua-chon-loc-hon-20201224000039783.html` |
| MFN-34 | `quy-hoach-ha-tang` | `bac-ninh-do-thi-da-cuc-bon-hanh-lang-phat-trien-2075` | `https://baochinhphu.vn/quy-hoach-chung-do-thi-bac-ninh-den-nam-2050-tam-nhin-den-nam-2075-102260724170506058.htm` |
| MFN-35 | `quy-hoach-ha-tang` | `quy-hoach-duong-bo-2050-bo-sung-nam-tuyen-cao-toc` | `https://baochinhphu.vn/chinh-thuc-cong-bo-quy-hoach-mang-luoi-cao-toc-quoc-lo-tam-nhin-den-2050-102260723105309397.htm` |
| MFN-36 | `quy-hoach-ha-tang` | `hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong` | `https://baochinhphu.vn/dua-hung-yen-tro-thanh-thanh-pho-truc-thuoc-trung-uong-truoc-nam-2030-1022607241835057.htm` |
| MFN-37 | `phap-ly-du-an` | `luat-phat-trien-do-thi-khu-kinh-te-dac-biet-2026` | `https://baochinhphu.vn/chinh-phu-thong-nhat-noi-dung-2-du-an-luat-102260724151848293.htm` |
| MFN-38 | `phap-ly-du-an` | `sua-luat-kinh-doanh-bat-dong-san-tranh-chong-cheo-thu-tuc` | `https://baochinhphu.vn/thu-tuong-the-che-phai-tao-dot-pha-phat-trien-va-thuc-thi-phai-hieu-qua-khong-tro-thanh-diem-nghen-cua-diem-nghen-102260708141042833.htm` |
| MFN-39 | `lai-suat-tai-chinh` | `lai-suat-vay-nha-o-xa-hoi-nguoi-duoi-35-tuoi-6-5-2026` | `https://www.vietnamplus.vn/tu-17-ap-dung-lai-suat-vay-mua-nha-o-xa-hoi-voi-nguoi-tre-65-post1120731.vnp` |
| MFN-40 | `lai-suat-tai-chinh` | `lai-suat-cho-vay-binh-quan-thang-6-2026-len-10-5` | `https://vnexpress.net/lai-suat-cho-vay-binh-quan-len-10-5-mot-nam-5100137.html` |
| MFN-41 | `dau-tu-dong-tien` | `fdi-bat-dong-san-5-1-ty-usd-nua-dau-2026` | `https://fia.mof.gov.vn/Detail/CatID/660c5d67-53dc-464d-b07d-003e466e777b/NewsID/d1421a33-6967-4621-9d10-16aef2ec695c` |
| MFN-42 | `cho-thue` | `bo-xay-dung-ra-soat-130571-can-phong-nha-o-cho-thue` | `https://baochinhphu.vn/day-manh-phat-trien-nha-o-xa-hoi-va-nha-o-cho-thue-102260707203018516.htm` |

Use these verified direct image URLs in the corresponding records:

| ID | Direct image URL |
| --- | --- |
| MFN-32 | `https://i2-vnexpress.vnecdn.net/2026/07/21/biet-thu-lien-ke-1784652235-6684-1784652509.jpg?w=1200&h=675&q=100&dpr=1&fit=crop&s=7kFAqfNSpAo0gd24W-nGtg` |
| MFN-33 | `https://media.tapchixaydung.vn/mediav2/upload/userfiles2021/images/lehuythao/vietnamcong_24072026063441_130.jpg` |
| MFN-34 | `https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2026/7/24/bcninh-1784887286397984928251-0-0-1200-1920-crop-17848873024721439373367.jpg` |
| MFN-35 | `https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2026/7/23/178477836729015020175842507653638737505633315533994fcf6e9a38d86465cdd40b35727c36b64-1784778385715743049709-0-39-697-1154-crop-1784778467327322914858.jpg` |
| MFN-36 | `https://bcp2.cdnchinhphu.vn/zoom/1200_630/334894974524682240/2026/7/24/edit-bai-22-1784892776616697606926-0-63-955-1591-crop-17848928489471989785143.png` |
| MFN-37 | `https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/7/24/vbpl-anh-1784880919709972427709.jpg` |
| MFN-38 | `https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/7/9/base64-17835673244621391838867.png` |
| MFN-39 | `https://media.vietnamplus.vn/images/384356310dcddb311c128c7b324095c9ff43d3357ceb4d6fb03e1c991a4c1c53cdb57feb901aea868e56e8a402356a73/1111.png.avif` |
| MFN-41 | `https://fia.mof.gov.vn/Portals/0/Upload/3/News/2026/7/15/images%20%289%29_V150.jpeg` |
| MFN-42 | `https://bcp.cdnchinhphu.vn/thumb_w/777/334894974524682240/2026/7/7/178343074293215020175842507653638737505633315533994970d99f03fd80affad6bf46ceb2a0133-17834307763451141709134.jpg` |

For MFN-40, extract the genuine `og:image` or an in-article image from the
canonical VnExpress page during Step 1 and record that direct URL. If the page
does not expose a genuine article image, stop Task 1 with `NEEDS_CONTEXT`
instead of using a placeholder or unrelated illustration.

Record the supporting facts from the approved research:

```text
MFN-32: 1.110 căn mở bán; 660 giao dịch; giảm 30% theo quý và 74% theo năm; giá sơ cấp bình quân 209 triệu đồng/m²; khoảng giá phổ biến 15–50 tỷ đồng.
MFN-33: giá căn hộ Hà Nội và TP.HCM còn cao; thanh khoản chậm lại; số dự án nhà ở thương mại được cấp phép giảm; nguồn cung lệch về trung và cao cấp.
MFN-34: Quyết định 1389; 99 xã/phường; 3 vùng, 4 hành lang, 6 cụm tăng trưởng; mục tiêu thành phố trực thuộc Trung ương trước 2030.
MFN-35: 46 tuyến cao tốc dài 10.106 km; 136 quốc lộ dài 26.340 km; bổ sung 5 cao tốc; điều chỉnh 12 quốc lộ; chuyển 36 tuyến.
MFN-36: mục tiêu thành phố trực thuộc Trung ương trước 2030; trục Bắc–Nam 89 km, rộng 180 m; GRDP sáu tháng tăng 10,72%; vốn đầu tư tăng 14,4%; giải ngân đầu tư công 35,7%.
MFN-37: Nghị quyết 198; dự thảo Luật Phát triển đô thị; phân định khu thương mại tự do và khu kinh tế đặc biệt; Bộ trưởng Tư pháp hoàn thiện và giải trình.
MFN-38: sửa Luật Kinh doanh bất động sản và Luật Nhà ở; tránh song song thủ tục chuyển nhượng dự án và giao đất; luật nhà ở điều chỉnh nhà ở cho thuê và quỹ nhà ở địa phương.
MFN-39: lãi suất 6,5%/năm từ tháng 7 đến hết tháng 12/2026; năm năm đầu thấp hơn 2 điểm phần trăm; 10 năm tiếp theo 7,5%; chín ngân hàng tham gia.
MFN-40: lãi suất cho vay bình quân tháng 6 là 8,1–10,5%/năm, tăng 0,4 điểm phần trăm; cho vay ưu tiên ngắn hạn 3,9%; tiền gửi 6–12 tháng 6,1–7,6%; trên 24 tháng 7,1–7,8%.
MFN-41: tổng FDI đăng ký 34,65 tỷ USD, tăng 61%; bất động sản 5,1 tỷ USD, chiếm 17,9%; vốn thực hiện bất động sản 965,2 triệu USD, chiếm 7,4%; tổng thực hiện 13,03 tỷ USD, tăng 11,2%.
MFN-42: 96 dự án với 27.636 căn hoàn thành từ đầu 2026; lũy kế 866 dự án với 757.338 căn; 130.571 căn/phòng được báo cáo để rà soát; chỉ tiêu năm 2026 là 158.700 căn nhà ở xã hội.
```

- [ ] **Step 4: Check uniqueness against the canonical dataset**

Run:

```powershell
$urls = Select-String -Path 'docs\research\2026-07-25-editorial-expansion-sources.md' -Pattern 'https://'
$urls.Count
```

Then compare every canonical URL and slug against `data/news/articles.json`.

Expected: 12 new canonical source URLs, 12 new slugs, and zero matches in the existing 30 articles.

- [ ] **Step 5: Commit the frozen research brief**

```powershell
git add docs/research/2026-07-25-editorial-expansion-sources.md
git commit -m "docs: verify editorial expansion sources"
```

Expected: one documentation-only commit and a clean task diff.

---

### Task 2: Centralize the 42-article dataset contract

**Files:**
- Create: `scripts/lib/news-dataset-contract.ts`
- Modify: `scripts/lib/seed-invariants.ts`
- Test: `apps/backend/test/seed-invariants.spec.ts`

**Interfaces:**
- Produces: `EXPECTED_ARTICLE_COUNTS`, `EXPECTED_PUBLISHED_ARTICLES`, `EXPECTED_FEATURED_ARTICLES`, and `NewsDatasetCategorySlug`.
- Consumes: no frontend code and no database credentials.

- [ ] **Step 1: Write failing invariant tests**

Add assertions that build a valid 42-article snapshot from the exact count map, then separately fail when a category has one too few articles or the total is 41:

```ts
import {
  EXPECTED_ARTICLE_COUNTS,
  EXPECTED_FEATURED_ARTICLES,
  EXPECTED_PUBLISHED_ARTICLES,
} from '../../../scripts/lib/news-dataset-contract';

const articles = Object.entries(EXPECTED_ARTICLE_COUNTS).flatMap(
  ([categorySlug, count]) =>
    Array.from({ length: count }, (_, index) => ({
      slug: `${categorySlug}-${index + 1}`,
      categorySlug,
      sourceUrl: `https://example.com/${categorySlug}/${index + 1}`,
      isFeatured: index === 0 && categorySlug !== 'cho-thue',
    })),
);

assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
assert.equal(
  articles.filter((article) => article.isFeatured).length,
  EXPECTED_FEATURED_ARTICLES,
);
```

- [ ] **Step 2: Run the targeted test and verify red**

Run:

```powershell
$env:Path='C:\tmp\node-v22.22.0-win-x64;' + $env:Path
npm.cmd run test:api -- --test-name-pattern="seed invariant"
```

Expected: FAIL because `scripts/lib/news-dataset-contract.ts` does not exist or old uniform-count assertions reject the 42-article snapshot.

- [ ] **Step 3: Add the exact shared contract**

```ts
export const EXPECTED_ARTICLE_COUNTS = {
  'thi-truong-gia-ca': 8,
  'quy-hoach-ha-tang': 8,
  'phap-ly-du-an': 7,
  'lai-suat-tai-chinh': 7,
  'dau-tu-dong-tien': 6,
  'cho-thue': 6,
} as const;

export type NewsDatasetCategorySlug = keyof typeof EXPECTED_ARTICLE_COUNTS;

export const EXPECTED_PUBLISHED_ARTICLES = Object.values(
  EXPECTED_ARTICLE_COUNTS,
).reduce((total, count) => total + count, 0);

export const EXPECTED_FEATURED_ARTICLES = 5;
```

Update `assertSeedInvariants` to compare per-category counts against this map, the total against `EXPECTED_PUBLISHED_ARTICLES`, and the featured total against `EXPECTED_FEATURED_ARTICLES`. Preserve unique slug and unique non-empty source URL checks.

- [ ] **Step 4: Run the targeted backend tests and verify green**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern="seed invariant"
```

Expected: every matching test passes, including exact unequal category counts and duplicate detection.

- [ ] **Step 5: Run TypeScript checks for both workspaces**

Run:

```powershell
npm.cmd run typecheck:api
npm.cmd run typecheck:web
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit the dataset contract**

```powershell
git add scripts/lib/news-dataset-contract.ts scripts/lib/seed-invariants.ts apps/backend/test/seed-invariants.spec.ts
git commit -m "test: define expanded news dataset contract"
```

---

### Task 3: Integrate and strictly validate the 12 new articles

**Files:**
- Modify: `data/news/articles.json`
- Modify: `data/news/images.json`
- Modify: `scripts/lib/official-news-data.ts`
- Create: `apps/backend/test/official-news-data.spec.ts`
- Create: `apps/frontend/public/images/news/researched/nguon-cung-so-cap-tang-40-hap-thu-giam-62-nua-dau-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/biet-thu-lien-ke-ha-noi-thanh-khoan-giam-74-quy-2-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/gia-can-ho-neo-cao-nguoi-mua-chon-loc-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/bac-ninh-do-thi-da-cuc-bon-hanh-lang-phat-trien-2075.jpg`
- Create: `apps/frontend/public/images/news/researched/quy-hoach-duong-bo-2050-bo-sung-nam-tuyen-cao-toc.jpg`
- Create: `apps/frontend/public/images/news/researched/hung-yen-truc-bac-nam-89km-thanh-pho-truc-thuoc-trung-uong.jpg`
- Create: `apps/frontend/public/images/news/researched/luat-phat-trien-do-thi-khu-kinh-te-dac-biet-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/sua-luat-kinh-doanh-bat-dong-san-tranh-chong-cheo-thu-tuc.jpg`
- Create: `apps/frontend/public/images/news/researched/lai-suat-vay-nha-o-xa-hoi-nguoi-duoi-35-tuoi-6-5-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/lai-suat-cho-vay-binh-quan-thang-6-2026-len-10-5.jpg`
- Create: `apps/frontend/public/images/news/researched/fdi-bat-dong-san-5-1-ty-usd-nua-dau-2026.jpg`
- Create: `apps/frontend/public/images/news/researched/bo-xay-dung-ra-soat-130571-can-phong-nha-o-cho-thue.jpg`

**Interfaces:**
- Consumes: `EXPECTED_ARTICLE_COUNTS`, `EXPECTED_PUBLISHED_ARTICLES`, `EXPECTED_FEATURED_ARTICLES`, and the Task 1 research brief.
- Produces: a canonical 42-article dataset accepted by `loadOfficialArticles()`, with exact slug-to-image equality.

- [ ] **Step 1: Write the failing canonical-loader test**

Create a test that loads the real files and asserts exact totals, exact category counts, complete provenance, no placeholders for the 12 new slugs, and one existing local image for every record:

```ts
test('loads the exact recruiter-ready 42-article dataset', () => {
  const articles = loadOfficialArticles();
  assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
  assert.equal(
    articles.filter((article) => article.isFeatured).length,
    EXPECTED_FEATURED_ARTICLES,
  );

  for (const [categorySlug, expected] of Object.entries(
    EXPECTED_ARTICLE_COUNTS,
  )) {
    assert.equal(
      articles.filter((article) => article.categorySlug === categorySlug).length,
      expected,
    );
  }

  for (const article of articles) {
    assert.ok(article.sourceUrl.startsWith('https://'));
    assert.ok(article.author.name.trim());
    assert.ok(article.evidence.length > 0);
    assert.ok(article.image.localPath.startsWith('/images/news/'));
  }
});
```

Add explicit set equality between all article slugs and all keys in `images.json`; verify the resolved local path exists below `apps/frontend/public` and cannot escape that directory.

- [ ] **Step 2: Run the canonical-loader test and verify red**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern="42-article dataset"
```

Expected: FAIL because the canonical dataset still has 30 articles.

- [ ] **Step 3: Draft the 12 complete canonical article records**

For each Task 1 record, write:

- a Vietnamese headline and complete excerpt;
- a 500–800 word original editorial summary in Markdown;
- short sections that distinguish source facts from analysis;
- author metadata using the established editorial author schema;
- two to five relevant tags;
- ISO publication date from the source;
- a realistic reading time calculated from the body;
- the exact canonical source URL and publisher;
- evidence entries mapping each numeric or legal claim to its source;
- accurate image plan, alt text, direct source image URL, page URL, and credit.

Do not quote more than 25 words from a single source. Paraphrase source reporting and avoid extending facts beyond the verified brief.

- [ ] **Step 4: Normalize the 12 images**

Copy only the verified Task 1 image downloads into the exact local paths above. Use a maximum 1600px long edge, preserve aspect ratio, strip unnecessary metadata, encode JPEG at quality 82, and visually inspect each result for crop, orientation, and relevance.

Expected: 12 valid JPEG files, none equal to the repository placeholder, and no source image hotlink used by the frontend.

- [ ] **Step 5: Add the 12 `images.json` provenance records**

Use this exact shape, substituting the corresponding Task 1 values:

```json
"nguon-cung-so-cap-tang-40-hap-thu-giam-62-nua-dau-2026": {
  "localPath": "/images/news/researched/nguon-cung-so-cap-tang-40-hap-thu-giam-62-nua-dau-2026.jpg",
  "originalImageUrl": "https://i2-vnexpress.vnecdn.net/2026/07/16/1784175661852bd66846f5454640dc-7227-2551-1784176607.jpg?w=1200&h=675&q=100&dpr=1&fit=crop&s=TFosauBx3Ryvn3jq2NVyhQ",
  "sourcePageUrl": "https://vnexpress.net/giao-dich-bat-dong-san-giam-manh-nua-dau-nam-5097659.html",
  "credit": "Ảnh theo bài nguồn VnExpress",
  "isPlaceholder": false
}
```

- [ ] **Step 6: Replace legacy uniform-count checks in the loader**

Import the shared contract, reject count mismatches by slug, require exact article/image key equality, and make chronological ordering deterministic:

```ts
articles.sort(
  (left, right) =>
    Date.parse(right.publishedAt) - Date.parse(left.publishedAt) ||
    left.slug.localeCompare(right.slug, 'vi'),
);
```

Preserve the existing schema, Markdown sanitization, canonical URL checks, and path containment protections.

- [ ] **Step 7: Select exactly five featured records**

Set `isFeatured` so the latest overview contains one strong lead and at least two visually distinct supporting stories while the total remains exactly five. Do not change API logic to compensate for an invalid dataset.

- [ ] **Step 8: Run focused content validation**

Run:

```powershell
npm.cmd run test:api -- --test-name-pattern="official news|seed invariant"
npm.cmd run db:validate
npm.cmd run db:generate
```

Expected: canonical-loader and invariant tests pass; Prisma validate and generate exit `0`.

- [ ] **Step 9: Inspect the final count and provenance report**

Run a read-only script through the canonical loader that prints only slugs, category counts, featured total, and local image paths.

Expected:

```text
published=42
featured=5
thi-truong-gia-ca=8
quy-hoach-ha-tang=8
phap-ly-du-an=7
lai-suat-tai-chinh=7
dau-tu-dong-tien=6
cho-thue=6
```

- [ ] **Step 10: Commit canonical content**

```powershell
git add data/news scripts/lib/official-news-data.ts apps/backend/test/official-news-data.spec.ts apps/frontend/public/images/news/researched
git commit -m "feat: expand verified news dataset to 42 articles"
```

---

### Task 4: Align preview, seed verification, smoke checks, and documentation

**Files:**
- Modify: `apps/frontend/lib/researched-news.ts`
- Modify: `apps/frontend/test/researched-news.spec.ts`
- Modify: `scripts/smoke-production.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: the shared dataset contract and canonical loader from Tasks 2–3.
- Produces: deterministic local preview ordering and public smoke assertions for the exact production dataset.

- [ ] **Step 1: Write failing preview and smoke source tests**

Update the preview test to expect 42 articles and the exact map. Add source assertions that `smoke-production.ts` imports the shared contract rather than containing `30` or a uniform `5` rule.

```ts
assert.equal(articles.length, EXPECTED_PUBLISHED_ARTICLES);
assert.deepEqual(categoryCounts, EXPECTED_ARTICLE_COUNTS);
assert.equal(new Set(articles.map(({ slug }) => slug)).size, 42);
```

- [ ] **Step 2: Run the targeted tests and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="researched news|production smoke"
```

Expected: FAIL on legacy 30-article or uniform-count assumptions.

- [ ] **Step 3: Make preview ordering deterministic**

Replace hardcoded totals with shared constants and use publication time followed by slug as the tie-breaker:

```ts
return [...articles].sort(
  (left, right) =>
    Date.parse(right.publishedAt) - Date.parse(left.publishedAt) ||
    left.slug.localeCompare(right.slug, 'vi'),
);
```

- [ ] **Step 4: Update production smoke assertions**

Import `EXPECTED_ARTICLE_COUNTS` and `EXPECTED_PUBLISHED_ARTICLES`. Assert six categories, each category's approved count, page-one and page-two pagination, and the 42 total reported by the API. Keep health, detail, frontend, static asset, and Next Image checks.

- [ ] **Step 5: Update README dataset statements**

State that the deterministic dataset contains 42 published articles across six intentionally uneven categories, exactly five featured stories, complete provenance, and idempotent verification. Do not add preview URLs or credentials.

- [ ] **Step 6: Run the focused tests and commit**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="researched news|production smoke"
npm.cmd run typecheck:web
```

Expected: all matching tests and frontend typecheck pass.

```powershell
git add apps/frontend/lib/researched-news.ts apps/frontend/test/researched-news.spec.ts scripts/smoke-production.ts README.md
git commit -m "test: align expanded dataset verification"
```

---

### Task 5: Build the shared editorial frame, image boundary, and card variants

**Files:**
- Modify: `apps/frontend/app/globals.css`
- Modify: `apps/frontend/components/Header.tsx`
- Modify: `apps/frontend/components/Header.module.css`
- Modify: `apps/frontend/components/Footer.tsx`
- Modify: `apps/frontend/components/Footer.module.css`
- Modify: `apps/frontend/components/NewsTabs.tsx`
- Modify: `apps/frontend/components/NewsTabs.module.css`
- Modify: `apps/frontend/components/NewsImage.tsx`
- Modify: `apps/frontend/components/NewsCard.tsx`
- Modify: `apps/frontend/components/NewsCard.module.css`
- Modify: `apps/frontend/test/editorial-ui-source.spec.ts`
- Modify: `apps/frontend/test/news-presentation-source.spec.ts`

**Interfaces:**
- Produces: `NewsImage({ src?, alt, className?, priority?, sizes? })`.
- Produces: `NewsCard({ article, variant?, showExcerpt? })`, where `variant` is `'lead' | 'supporting' | 'feed' | 'compact' | 'related'`.
- Consumes: existing API article types and working internal routes only.

- [ ] **Step 1: Write failing source-contract tests**

Assert the exact token colors, both system font stacks, focus-visible styling, reduced-motion media query, `sizes` support, all five card variants, seven working tab entries, and absence of fake search/login/newsletter controls.

```ts
assert.match(globalsCss, /--color-brand:\s*#9F1D2D/i);
assert.match(globalsCss, /--font-editorial:.*Georgia.*Cambria/i);
assert.match(newsImageSource, /sizes\?: string/);
assert.match(newsCardSource, /'lead'.*'supporting'.*'feed'.*'compact'.*'related'/s);
```

- [ ] **Step 2: Run tests and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="editorial UI|news presentation"
```

Expected: FAIL on missing exact tokens, `sizes`, or card variants.

- [ ] **Step 3: Add global tokens and shared accessibility primitives**

Add:

```css
:root {
  --color-brand: #9f1d2d;
  --color-red: #c62832;
  --color-ink: #172033;
  --color-page: #f7f6f3;
  --color-surface: #ffffff;
  --color-muted: #667085;
  --color-rose: #fbeaec;
  --color-gold: #b88a44;
  --font-editorial: Georgia, Cambria, "Times New Roman", serif;
  --font-interface: "Segoe UI", Helvetica, Arial, sans-serif;
  --content-width: 1200px;
  --reading-width: 760px;
}

:focus-visible {
  outline: 3px solid var(--color-brand);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

Keep component-specific grid and card declarations out of `globals.css`.

- [ ] **Step 4: Refine Header, Footer, and NewsTabs**

Keep the wordmark, `Bản tin` channel label, compact brand statement, overview route, and six category routes. Use semantic `header`, `nav`, and `footer`; mark the current link with `aria-current="page"`. Make the tab row horizontally scrollable below 768px, with 44px minimum link height.

- [ ] **Step 5: Add responsive image sizing**

Use:

```ts
type NewsImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function NewsImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: NewsImageProps) {
  return (
    <Image
      src={src || FALLBACK_NEWS_IMAGE}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
```

Preserve the existing safe fallback behavior and stable containing aspect ratio.

- [ ] **Step 6: Implement explicit card variants**

Map each variant to a deterministic `sizes` string:

```ts
const IMAGE_SIZES = {
  lead: '(max-width: 768px) 100vw, 66vw',
  supporting: '(max-width: 768px) 100vw, 34vw',
  feed: '(max-width: 768px) 100vw, 320px',
  compact: '112px',
  related: '(max-width: 768px) 100vw, 33vw',
} satisfies Record<NonNullable<NewsCardProps['variant']>, string>;
```

Render category, headline, date, reading time, author, excerpt, and views only when supported by the article shape and variant. Every card headline must be a working article link.

- [ ] **Step 7: Run focused tests and frontend build**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="editorial UI|news presentation"
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: tests, typecheck, and production build exit `0`.

- [ ] **Step 8: Commit shared UI primitives**

```powershell
git add apps/frontend/app/globals.css apps/frontend/components apps/frontend/test/editorial-ui-source.spec.ts apps/frontend/test/news-presentation-source.spec.ts
git commit -m "feat: establish editorial design system"
```

---

### Task 6: Redesign the overview with working pagination

**Files:**
- Modify: `apps/frontend/components/FeaturedNews.tsx`
- Modify: `apps/frontend/components/FeaturedNews.module.css`
- Modify: `apps/frontend/components/PopularStories.tsx`
- Modify: `apps/frontend/components/PopularStories.module.css`
- Modify: `apps/frontend/components/CategoryDirectory.tsx`
- Modify: `apps/frontend/components/CategoryDirectory.module.css`
- Modify: `apps/frontend/app/ban-tin/page.tsx`
- Modify: `apps/frontend/app/ban-tin/page.module.css`
- Modify: `apps/frontend/test/editorial-ui-source.spec.ts`
- Modify: `apps/frontend/test/news-route-source.spec.ts`

**Interfaces:**
- Consumes: `FeaturedNews({ articles })`, `NewsCard`, `Pagination`, the existing list API client, and category API client.
- Produces: one lead plus exactly two supporting hero stories; a paginated newest feed; a semantic numbered popular list; a category directory.

- [ ] **Step 1: Write failing overview composition tests**

Assert:

```ts
assert.match(pageSource, /searchParams/);
assert.match(pageSource, /Pagination/);
assert.match(featuredSource, /articles\.slice\(1,\s*3\)/);
assert.match(popularSource, /<ol/);
assert.match(popularSource, /index \+ 1/);
assert.doesNotMatch(pageSource, /<main/);
```

Also assert the overview requests the page selected from `searchParams`, preserves a bounded page size, and links the callout to the category directory.

- [ ] **Step 2: Run route and UI tests and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="editorial UI|news route"
```

Expected: FAIL because the overview lacks the approved composition or pagination.

- [ ] **Step 3: Implement overview query parsing**

Use a positive integer parser and a fixed page size:

```ts
const LATEST_PAGE_SIZE = 10;

function parsePage(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
```

Fetch categories, five featured, current latest page, and popular stories through the existing client. Preserve the current API-only fetch path and error behavior.

- [ ] **Step 4: Implement the four editorial layers**

Render one `h1`, exactly one lead, exactly two supports, `Tin mới nhất`, an `aside` containing `Đọc nhiều`, a working `Pagination`, and `CategoryDirectory`. Do not create a nested `main` because the root layout already owns the main landmark.

- [ ] **Step 5: Implement responsive overview CSS**

Use a 2:1 hero grid and a content/sidebar grid above 1024px, collapse to one column below 768px, clamp long headings, preserve stable image ratios, and ensure the page itself never overflows horizontally.

- [ ] **Step 6: Run focused tests, typecheck, and build**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="editorial UI|news route"
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: all commands exit `0`.

- [ ] **Step 7: Commit the overview**

```powershell
git add apps/frontend/components/FeaturedNews* apps/frontend/components/PopularStories* apps/frontend/components/CategoryDirectory* apps/frontend/app/ban-tin/page.tsx apps/frontend/app/ban-tin/page.module.css apps/frontend/test
git commit -m "feat: redesign editorial news overview"
```

---

### Task 7: Redesign category pages without breaking page-two semantics

**Files:**
- Modify: `apps/frontend/app/ban-tin/[category]/page.tsx`
- Modify: `apps/frontend/app/ban-tin/[category]/page.module.css`
- Modify: `apps/frontend/components/NewsList.tsx`
- Modify: `apps/frontend/components/NewsList.module.css`
- Modify: `apps/frontend/test/news-route-source.spec.ts`
- Modify: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**
- Consumes: existing `CATEGORY_PAGE_SIZE = 4`, category list response metadata, `PopularStories`, `CategoryDirectory`, `Pagination`, and `NewsCard`.
- Produces: page-one lead only, horizontal feed, category count, filtered popular stories, directory side panel, and unchanged page-two access.

- [ ] **Step 1: Write failing category-route tests**

Assert that `page === 1` controls the lead treatment, page size remains four, the API category description and article total appear in the masthead, side panels are present, and pagination continues to use `/ban-tin/${category.slug}`.

```ts
assert.match(source, /CATEGORY_PAGE_SIZE\s*=\s*4/);
assert.match(source, /page === 1/);
assert.match(source, /meta\.total/);
assert.match(source, /PopularStories/);
assert.match(source, /CategoryDirectory/);
```

- [ ] **Step 2: Run route tests and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="news route|editorial UI"
```

Expected: FAIL on absent count or side-panel composition while existing page-size tests remain green.

- [ ] **Step 3: Implement the category masthead and feed**

Render breadcrumb, active `NewsTabs`, category name, API description, and article total. On page one only, render the first returned article as `lead`; render remaining articles as `feed`. On later pages, render every returned article as `feed`.

- [ ] **Step 4: Add category-aware empty messaging**

Extend `NewsList` with:

```ts
type NewsListProps = {
  articles: ArticleListItem[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};
```

The empty state must name the category and link to `/ban-tin`.

- [ ] **Step 5: Add side panels and responsive layout**

Request popular stories filtered by the current category using the existing API client, render a category directory beneath it, and place both in an `aside`. Collapse to document order below 1024px.

- [ ] **Step 6: Run focused tests and build**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="news route|editorial UI"
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: page-one rules, page-two rules, typecheck, and build all pass.

- [ ] **Step 7: Commit category pages**

```powershell
git add apps/frontend/app/ban-tin/[category] apps/frontend/components/NewsList* apps/frontend/test
git commit -m "feat: refine category reading flow"
```

---

### Task 8: Redesign article detail for focused reading and provenance

**Files:**
- Modify: `apps/frontend/app/ban-tin/[category]/[slug]/page.tsx`
- Modify: `apps/frontend/app/ban-tin/[category]/[slug]/page.module.css`
- Modify: `apps/frontend/components/ArticleHeader.tsx`
- Modify: `apps/frontend/components/ArticleHeader.module.css`
- Modify: `apps/frontend/components/ArticleContent.tsx`
- Modify: `apps/frontend/components/ArticleContent.module.css`
- Modify: `apps/frontend/components/SourceEvidence.tsx`
- Modify: `apps/frontend/components/SourceEvidence.module.css`
- Modify: `apps/frontend/components/RelatedNews.tsx`
- Modify: `apps/frontend/components/RelatedNews.module.css`
- Modify: `apps/frontend/test/news-route-source.spec.ts`
- Modify: `apps/frontend/test/editorial-ui-source.spec.ts`

**Interfaces:**
- Consumes: sanitized `contentHtml`, article evidence, related/previous/next API responses, `PopularStories`, and `CategoryDirectory`.
- Produces: 720–780px reading column, `Nguồn tham khảo`, wide image and caption, working related/previous/next navigation, and desktop side panels.

- [ ] **Step 1: Write failing article-page tests**

Assert the exact evidence title, popular/category side panels, reading-width token, metadata, provenance caption, and retention of previous/next and related navigation:

```ts
assert.match(evidenceSource, /Nguồn tham khảo/);
assert.match(pageSource, /PopularStories/);
assert.match(pageSource, /CategoryDirectory/);
assert.match(css, /var\(--reading-width\)/);
assert.match(pageSource, /RelatedNews/);
```

- [ ] **Step 2: Run route and UI tests and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="news route|editorial UI"
```

Expected: FAIL on the approved evidence copy or side-panel layout.

- [ ] **Step 3: Refine the article header**

Render breadcrumb, category link, serif `h1`, excerpt, author, publication date, views, and reading time. Keep all metadata conditional on actual API values. Use a wide stable cover ratio, meaningful alt text, and a caption containing source credit.

- [ ] **Step 4: Build the reading grid**

Use a main reading column capped by `--reading-width` and an `aside` on wide screens. Continue rendering only the existing sanitized `contentHtml`; do not add `dangerouslySetInnerHTML` outside the current sanitizer boundary.

- [ ] **Step 5: Refine content and evidence typography**

Style headings, paragraphs, lists, blockquotes, and links for comfortable reading. Rename the evidence panel heading to `Nguồn tham khảo`, retain working canonical source links, and visibly distinguish verified evidence from editorial prose.

- [ ] **Step 6: Preserve navigation and add contextual side panels**

Keep previous/next and related-story links. Fetch popular stories with the existing client; when no popular result is available, use already fetched related articles as a display fallback. Render `CategoryDirectory` below it.

- [ ] **Step 7: Run focused tests, typecheck, and build**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="news route|editorial UI"
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: all commands exit `0`.

- [ ] **Step 8: Commit article detail**

```powershell
git add apps/frontend/app/ban-tin/[category]/[slug] apps/frontend/components/Article* apps/frontend/components/SourceEvidence* apps/frontend/components/RelatedNews* apps/frontend/test
git commit -m "feat: improve article reading experience"
```

---

### Task 9: Complete responsive, resilient, and accessibility states

**Files:**
- Create: `apps/frontend/test/editorial-responsive-source.spec.ts`
- Modify: `apps/frontend/app/ban-tin/loading.tsx`
- Modify: `apps/frontend/app/ban-tin/loading.module.css`
- Modify: `apps/frontend/app/ban-tin/error.tsx`
- Modify: `apps/frontend/app/ban-tin/error.module.css`
- Modify: `apps/frontend/app/ban-tin/not-found.tsx`
- Modify: `apps/frontend/app/ban-tin/not-found.module.css`
- Modify: relevant category/article loading, error, and not-found files already present in those route folders.
- Modify: CSS Modules touched by Tasks 5–8 when a responsive defect is proven.

**Interfaces:**
- Consumes: the shared tokens and route compositions.
- Produces: coherent loading, empty, error, and 404 states; one main landmark; touch-safe navigation; no page overflow at required widths.

- [ ] **Step 1: Write the failing responsive source test**

Assert:

```ts
assert.match(newsTabsCss, /overflow-x:\s*auto/);
assert.match(newsTabsCss, /min-height:\s*44px/);
assert.match(globalsCss, /prefers-reduced-motion:\s*reduce/);
assert.doesNotMatch(routeSources, /<main/g);
assert.match(errorSource, /reset\(\)/);
assert.match(notFoundSource, /href="\/ban-tin"/);
```

Also assert every Next Image call passes or inherits a responsive `sizes` value and mobile media rules reduce all two-column layouts to one column.

- [ ] **Step 2: Run the responsive test and verify red**

Run:

```powershell
npm.cmd run test:web -- --test-name-pattern="editorial responsive"
```

Expected: FAIL on at least one missing touch, landmark, image-size, or state requirement.

- [ ] **Step 3: Refine loading skeletons**

Match the real layouts: one lead plus two supports on overview, feed rows on category, and header/reading/sidebar blocks on detail. Mark decorative skeletons `aria-hidden="true"` and avoid announcing repeated empty text.

- [ ] **Step 4: Refine error and not-found states**

Use the existing error boundary `reset()` as a working retry action, include a working `/ban-tin` link, preserve category/article-specific language where route context exists, and do not mask unexpected errors as 404s.

- [ ] **Step 5: Remove nested main landmarks and overflow defects**

Keep the single root `<main>` from `app/layout.tsx`. Use `min-width: 0` on grid children, `overflow-wrap: anywhere` for long canonical links, horizontal scrolling only inside `NewsTabs`, and single-column breakpoints at 1024px/768px as defined by the component.

- [ ] **Step 6: Run full frontend tests and build**

Run:

```powershell
npm.cmd run test:web
npm.cmd run typecheck:web
npm.cmd run build:web
```

Expected: 100% frontend tests pass, typecheck passes, and Next.js production build exits `0`.

- [ ] **Step 7: Commit responsive states**

```powershell
git add apps/frontend/app apps/frontend/components apps/frontend/test/editorial-responsive-source.spec.ts
git commit -m "fix: harden responsive editorial states"
```

---

### Task 10: Run complete local gates and validate the preview deployment

**Files:**
- Modify: `.superpowers/sdd/progress.md` after each reviewed task; this file remains local ledger state if ignored.
- Modify: frontend files only when browser evidence proves a defect.
- Modify: dataset files only when verification proves a factual or structural defect.

**Interfaces:**
- Consumes: Tasks 1–9 and the existing Vercel preview workflow.
- Produces: a pushed feature branch with green CI, a non-production preview, three clean preview smoke runs, and a visual review package.

- [ ] **Step 1: Install from the committed lockfile on Node 22**

Run:

```powershell
$env:Path='C:\tmp\node-v22.22.0-win-x64;' + $env:Path
node --version
npm.cmd ci
```

Expected: Node prints `v22.22.0`; install exits `0`; `package-lock.json` remains unchanged.

- [ ] **Step 2: Run every local quality gate**

Set only the same non-secret placeholder environment variables used by CI for build validation, then run:

```powershell
npm.cmd run db:generate
npm.cmd run db:validate
npm.cmd run lint
npm.cmd run test:web
npm.cmd run test:api
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run build:api
npm.cmd audit --omit=dev
git diff --check
```

Expected: all commands exit `0`; production audit reports zero Critical and zero High vulnerabilities; no whitespace errors.

- [ ] **Step 3: Run local deterministic seed verification twice**

Use a disposable local PostgreSQL database and TLS Redis test instance only if already configured without exposing their URLs:

```powershell
npm.cmd run db:migrate:deploy
npm.cmd run db:seed
npm.cmd run db:verify
npm.cmd run db:seed
npm.cmd run db:verify
```

Expected on both verification runs: six categories, 42 published articles, exactly five featured, the exact approved category map, unique slugs, and unique source URLs.

- [ ] **Step 4: Push only the feature branch and wait for CI**

```powershell
git status --short
git push -u origin codex/editorial-refresh-content
gh run list --branch codex/editorial-refresh-content --limit 5
```

Expected: working tree is clean, push succeeds, and the newest branch workflow concludes successfully.

- [ ] **Step 5: Deploy a Vercel preview without moving production**

Deploy from `codex/editorial-refresh-content`. The frontend preview may point to the stable production API for visual validation of existing records; do not seed the production database and do not attach the stable production alias.

Expected: a public preview URL tied to the feature commit and separate from the production alias.

- [ ] **Step 6: Run browser verification at all required widths**

Inspect overview, all six category pages, page 2 for at least two categories, and at least three article details at 320, 375, 390, 768, 1024, and 1440 widths. Verify:

- one main landmark;
- no page-level horizontal overflow;
- working tab, pagination, category, retry, related, previous, and next links;
- visible keyboard focus and logical tab order;
- correct image crops, meaningful alt text, successful `/_next/image` responses;
- no unexpected console errors, 404s, or 500s;
- readable article content with images disabled.

- [ ] **Step 7: Run preview smoke three consecutive times**

Run the smoke script against preview frontend and the backend it is configured to use:

```powershell
npm.cmd run smoke:production
npm.cmd run smoke:production
npm.cmd run smoke:production
```

Expected: three consecutive passes. If preview still uses the stable 30-article API, record that the visual preview used stable data and rely on Task 10 Step 3 for 42-article content verification; do not weaken the smoke contract committed for final production.

- [ ] **Step 8: Obtain user visual approval**

Share the preview URL and direct links to overview, one category, page 2, and one article. The branch remains unmerged until the user approves the live rendering.

---

### Task 11: Final review, safe merge, production seed, cache invalidation, and handoff

**Files:**
- Modify: `README.md` with the stable production URL only if the URL changed.
- Modify: `.superpowers/sdd/progress.md` with final review and rollout evidence.

**Interfaces:**
- Consumes: user-approved preview, clean per-task reviews, green feature CI, production PostgreSQL/Redis/Vercel credentials already stored by providers.
- Produces: green `main`, 42-article production database, invalidated `news:` cache, latest production deployment, three production smoke passes, and the two recruiter links.

- [ ] **Step 1: Create the whole-branch review package**

Use the merge base rather than `HEAD~1`:

```powershell
$mergeBase = git merge-base origin/main HEAD
git log --oneline "$mergeBase..HEAD"
git diff --stat "$mergeBase..HEAD"
```

Generate the full review package with the Subagent-Driven Development helper and dispatch a fresh high-capability reviewer. The reviewer must assess spec compliance and code quality across research provenance, dataset invariants, UI semantics, responsive behavior, security, and deployment safety.

Expected: no open Critical or Important findings. Record Minor findings and their disposition in the progress ledger.

- [ ] **Step 2: Re-run the complete local gates after review fixes**

Repeat Task 10 Step 2 verbatim.

Expected: every gate exits `0` on the final reviewed commit.

- [ ] **Step 3: Merge safely into `main`**

After user approval and green feature CI, update local refs, confirm `origin/main` has not diverged unexpectedly, merge the reviewed feature branch without rewriting history, and push `main`.

Expected: `origin/main` contains the reviewed feature head and the main GitHub Actions run concludes successfully.

- [ ] **Step 4: Run production migration and deterministic seed**

Use provider-stored secrets without printing them:

```powershell
npm.cmd run db:migrate:deploy
npm.cmd run db:seed
npm.cmd run db:verify
npm.cmd run db:seed
npm.cmd run db:verify
```

Expected: both verify runs report six categories, 42 published, five featured, exact category counts, and no duplicates.

- [ ] **Step 5: Invalidate only MyFuture News Redis keys**

Connect through the existing TLS `REDIS_URL`, scan for the application namespace `news:*`, print only the number of matching keys, delete only those exact matched keys in bounded batches, and do not flush the Redis database.

Expected: the old list/detail/category caches are removed without exposing Redis credentials or touching unrelated keys.

- [ ] **Step 6: Confirm the Vercel production deployment is the latest main commit**

Wait for both backend and frontend production deployments. Confirm backend health reports PostgreSQL up and Redis up, the API reports 42 articles, and the frontend production alias resolves to the latest main commit.

- [ ] **Step 7: Run production smoke three times**

```powershell
npm.cmd run smoke:production
npm.cmd run smoke:production
npm.cmd run smoke:production
```

Expected: all three runs pass health, six categories, exact counts, pagination, details, overview, category, article, static asset, and Next Image checks.

- [ ] **Step 8: Verify unauthenticated recruiter access**

Open a private browser session with no provider login. Navigate from the production homepage through category pagination and an article detail.

Expected: no login, setup, cookie, or configuration step is required; no unexpected console errors or 404/500 responses occur.

- [ ] **Step 9: Deliver exactly the two primary links**

Provide:

```text
https://github.com/NCnguyenn/myfuture-news-test
https://myfuture-news-test.vercel.app
```

If the stable frontend alias differs at rollout, replace only the second line with the verified production alias. Do not substitute a preview deployment URL.
