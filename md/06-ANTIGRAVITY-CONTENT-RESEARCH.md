# Antigravity Content Research & Import Brief

**Status:** Draft for review  
**Language:** Vietnamese  
**Project:** MyFuture News module  
**Last reviewed:** 2026-07-23  

## 1. Purpose

Use Antigravity as a research and content-preparation assistant to replace the
current demo-only article data with a verified, source-backed content set.

The first run is **research-only**. Antigravity must produce a reviewable
content manifest and must not modify the Prisma schema, migrations, seed files,
database, or frontend until a human explicitly approves the manifest.

## 2. Current project context

The project currently contains:

- Next.js frontend under `apps/web`.
- NestJS API under `apps/api`.
- PostgreSQL and Prisma under `prisma`.
- Redis cache for read APIs.
- Six persisted categories and one UI-only Overview tab.
- Demo article data in `prisma/seed.ts`.
- Placeholder SVG images under `apps/web/public/images/news/`.

The current `Article` model has title, slug, excerpt, HTML content, thumbnail,
optional cover image, published date, source name/URL, category, view count and
reading time. It does **not** yet have a separate `Author` model or a
structured article-image/credit model.

Do not assume that the live database contains the latest seed. Database state
must be checked separately after the research manifest is approved.

## 3. Content target

Create a candidate set of at least **five published articles per category**:

| Category | Slug | Minimum |
|---|---|---:|
| Pháp lý dự án | `phap-ly-du-an` | 5 |
| Quy hoạch - Hạ tầng | `quy-hoach-ha-tang` | 5 |
| Lãi suất - Tài chính | `lai-suat-tai-chinh` | 5 |
| Thị trường - Giá cả | `thi-truong-gia-ca` | 5 |
| Đầu tư - Dòng tiền | `dau-tu-dong-tien` | 5 |
| Cho thuê | `cho-thue` | 5 |

The Overview tab is an aggregate UI view and must not be added as a seventh
database category.

### Freshness rule

- Prefer articles published or updated within the last 12 months relative to
  the research date.
- For each category, target at least two articles from the most recent 90 days
  when reliable sources exist.
- Record the exact source publication date and the research timestamp.
- Do not label a story “latest” unless the source date has been verified.
- If a category has no sufficiently recent trustworthy source, report the gap
  instead of inventing content.

## 4. Source policy

### Source priority

Search broadly, but use the original page as the evidence source. Prefer:

1. Vietnamese government and regulator websites.
2. Official provincial/municipal portals and project-owner announcements.
3. Reputable newspapers and established research organizations.
4. Public market reports with a clearly stated publisher and date.

Do not rely on a Google result snippet as evidence. Open the source page and
record its canonical URL.

### Source fields

Every candidate article must include:

- `sourceName`
- `sourceUrl`
- `sourceCanonicalUrl` when different
- `sourcePublishedAt`
- `sourceAccessedAt`
- `sourceType`
- `sourceLanguage`
- `sourceReliabilityNote`

Do not use a source that cannot be opened or whose date cannot be verified.
Paywalled sources may be listed as leads, but they must not be the only
evidence for an article.

### No fabrication

- Never invent a named author, date, organization, statistic, quote, image
  credit, or license.
- If the original source has no named person, use the source organization as
  the author candidate and set `authorType` to `organization`.
- If a required value cannot be verified, use `null` and add a
  `missingFields` entry. Do not guess.
- Keep claims tied to one or more source URLs.

## 5. Article content rules

The candidate content should be an original Vietnamese editorial summary based
on verified facts, not a copied article.

For each article:

- Write a clear Vietnamese title.
- Write an excerpt of 1-3 sentences.
- Write approximately 500-900 words of original body content for the detail
  page, unless the source is too short to support that length.
- Explain what happened, where/when it happened, why it matters, and which
  source supports each material claim.
- Preserve facts, numbers, names and dates accurately.
- Mark analysis or interpretation as analysis; do not present it as a source
  fact.
- Do not copy paragraphs or reconstruct the original article sentence by
  sentence.
- Direct quotations must be short, clearly marked, and attributed to the
  source. Avoid copying more than 25 words from any one source.
- Do not include investment, legal or financial advice as if it were a
  professional recommendation.
- Avoid sensational headlines that are not supported by the source.

### Required article metadata

Each candidate must have:

- `title`
- `slug`
- `excerpt`
- `bodyMarkdown` or `bodyHtml`
- `categorySlug`
- `author`
- `datePublished`
- `dateModified` when available
- `tags`
- `source`
- `images`
- `verification`

Use ISO 8601 dates with timezone information, for example
`2026-07-23T09:30:00+07:00`.

## 6. Author policy

Represent the author explicitly:

```json
{
  "name": "Tên tác giả hoặc tên tổ chức",
  "slug": "ten-tac-gia",
  "authorType": "person",
  "profileUrl": "https://example.com/author/...",
  "verified": true
}
```

Allowed `authorType` values:

- `person` - a named person shown on the source page.
- `organization` - a newsroom, ministry, regulator or publisher when no
  individual author is named.
- `unknown` - only when the source does not identify an author; this must be
  flagged for human review.

Do not infer an author from the domain name, URL, article slug or byline
formatting.

## 7. Image policy

Images from Google Images are **not automatically reusable**. Google states
that images may be copyrighted; the usage-rights filter is only a way to find
images with license information, and the license must still be checked on the
hosting site:

<https://support.google.com/websearch/answer/29508>

### Allowed image candidates

Use only one of these:

1. An image created by the project team.
2. An image with a verified CC0/Public Domain license.
3. An image with a verified Creative Commons license that permits the intended
   use, with attribution recorded.
4. An official press image whose host explicitly grants reuse permission.
5. A stock image with a documented license or purchase record.

Do not download or use an image solely because it appears in Google results.
Do not remove watermarks. Do not hotlink an image from an unknown source.

### Required image metadata

For every image, record:

- `url`
- `localPath` if downloaded after approval
- `alt`
- `caption`
- `credit`
- `license`
- `licenseUrl`
- `sourcePageUrl`
- `verified`

At minimum, propose one relevant cover image per article. Prefer a
high-resolution landscape image suitable for a 16:9 card/detail layout.
Content images are optional during the first research pass, but if proposed
they must have the same license and credit fields as the cover image.

If no image with a verified license can be found, set `images` to an empty list
and add `images` to `missingFields`. Keep the article as a review candidate;
do not substitute a random Google image.

## 8. Research workflow

### Phase A - Audit only

1. Read this file completely.
2. Inspect the current Prisma schema, seed, API types and frontend types.
3. Do not edit project files.
4. Report any mismatch between this brief and the current code.

### Phase B - Research and manifest

1. Search for candidate sources by category.
2. Open and verify each original source page.
3. Extract only the metadata and facts needed for an original summary.
4. Check for duplicate stories covering the same event.
5. Verify author, dates, source URL and image license.
6. Generate the candidate manifest.
7. Run the validation checklist in Section 11.

### Phase C - Human review gate

Stop and wait. Present:

- Candidate counts per category.
- Sources used.
- Missing or uncertain fields.
- Image-license exceptions.
- Duplicates or conflicting facts.
- Articles that need manual review.

Do not continue to schema, seed or database changes without explicit approval.

### Phase D - Import, only after approval

After approval, propose the smallest database changes needed for:

- `Author` records and the article-author relation.
- Article image records or equivalent structured image metadata.
- Source and license metadata.
- Tags/keywords if required by the approved UI.

Create a migration and import/seed process that is idempotent. Never delete
existing data as part of this work unless the user explicitly authorizes a
backup and destructive reset.

## 9. Manifest format

Write the research result to a new review artifact, for example:

`md/content-research/manifest-YYYY-MM-DD.json`

Do not place the manifest directly into `prisma/seed.ts` during Phase B.

Top-level shape:

```json
{
  "researchDate": "2026-07-23",
  "timezone": "Asia/Bangkok",
  "project": "myfuture-news-test",
  "categories": [
    {
      "slug": "phap-ly-du-an",
      "candidateCount": 5,
      "articles": []
    }
  ],
  "globalWarnings": []
}
```

Candidate article shape:

```json
{
  "title": "Tiêu đề tiếng Việt",
  "slug": "tieu-de-tieng-viet",
  "excerpt": "Tóm tắt ngắn.",
  "bodyMarkdown": "Nội dung tóm tắt nguyên bản...",
  "categorySlug": "phap-ly-du-an",
  "author": {
    "name": "Tên người viết hoặc tổ chức",
    "slug": "ten-nguoi-viet",
    "authorType": "person",
    "profileUrl": null,
    "verified": true
  },
  "datePublished": "2026-07-10T08:00:00+07:00",
  "dateModified": null,
  "tags": ["pháp lý", "bất động sản"],
  "source": {
    "sourceName": "Tên nguồn",
    "sourceUrl": "https://example.com/original",
    "sourceCanonicalUrl": "https://example.com/original",
    "sourcePublishedAt": "2026-07-09T15:00:00+07:00",
    "sourceAccessedAt": "2026-07-23T10:00:00+07:00",
    "sourceType": "official",
    "sourceLanguage": "vi",
    "sourceReliabilityNote": "Trang chính thức của cơ quan..."
  },
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "localPath": null,
      "alt": "Mô tả nội dung ảnh",
      "caption": "Chú thích ảnh",
      "credit": "Tên tác giả ảnh hoặc tổ chức",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "sourcePageUrl": "https://example.com/original",
      "verified": true
    }
  ],
  "verification": {
    "factsChecked": true,
    "authorChecked": true,
    "dateChecked": true,
    "imageLicenseChecked": true,
    "duplicateChecked": true,
    "missingFields": [],
    "notes": []
  }
}
```

## 10. Search guidance by category

Use Vietnamese search queries that combine the topic, location and date. Search
the relevant official domain directly whenever possible.

Examples:

- `pháp lý dự án giấy phép site:gov.vn`
- `quy hoạch hạ tầng giao thông site:gov.vn`
- `lãi suất tín dụng bất động sản site:sbv.gov.vn`
- `thị trường giá bất động sản báo cáo 2026`
- `đầu tư dòng tiền bất động sản báo cáo`
- `thị trường cho thuê căn hộ báo cáo 2026`

These are search starting points, not approved sources. Antigravity must
verify the original page and record the actual source used.

## 11. Validation checklist

Before asking for approval, verify:

- [ ] Every category has at least 5 candidate published articles.
- [ ] Every article has a unique slug.
- [ ] Every article has a category from the approved six-category list.
- [ ] Every article has a verified source URL.
- [ ] Every article has a verified source publication date.
- [ ] Every author is verified, or explicitly marked `unknown`.
- [ ] Every article has an original Vietnamese summary.
- [ ] No copied full paragraphs are present.
- [ ] Every proposed image has a verified license and credit, or is listed in
  `missingFields`.
- [ ] No image is included solely because it was found in Google Images.
- [ ] No duplicate article or repeated source event exists within one category.
- [ ] Material facts have a source note.
- [ ] Articles with contradictory facts are flagged for human review.
- [ ] The manifest is valid JSON and can be reviewed without importing it.

## 12. Stop conditions

Stop immediately and report instead of guessing when:

- A source page cannot be opened.
- The author or publication date is ambiguous.
- The image license cannot be verified.
- Two reliable sources contradict each other.
- A category cannot reach five trustworthy articles.
- The task would require bypassing a paywall, login, robots restriction or
  access control.
- The requested operation would delete, reset or overwrite database data.

## 13. Definition of done for the research phase

The research phase is complete only when:

1. The manifest exists as a separate review artifact.
2. It contains at least five candidate articles per category, or clearly
   documents why a category is below the target.
3. Each record contains source, author, date, content and image-license status.
4. Validation results and warnings are included.
5. No project source code, Prisma schema, migration, seed or database has been
   changed.
6. Antigravity stops and waits for human approval.

## 14. Kick-off prompt for Antigravity

Copy the prompt below into Antigravity:

```text
Read `md/06-ANTIGRAVITY-CONTENT-RESEARCH.md` completely and treat it as the
source of truth.

Start with Phase A and Phase B only:

1. Audit the current project schema, seed data, API types and frontend types.
2. Research current Vietnamese news for all six approved categories.
3. Produce a reviewable JSON manifest with at least five candidate published
   articles per category.
4. Include verified source URL, source publication date, author, article dates,
   original Vietnamese summary, image URL, image credit and image license.
5. Mark every missing or uncertain field explicitly.

Do not copy full articles. Do not use an image solely because it appears in
Google Images. Do not invent authors, dates, facts, sources or licenses.

Do not modify Prisma schema, migrations, seed files, frontend files, or the
database. Do not download or import assets yet.

When the manifest and validation report are ready, stop and wait for human
approval. Report the exact output paths and the candidate count per category.
```

