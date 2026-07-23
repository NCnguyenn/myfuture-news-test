# Phase 3 apply + verify (Windows PowerShell)
# Run from repo root:  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\phase3-apply-and-verify.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "==> npm.cmd install"
npm.cmd install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "==> docker compose up -d"
docker compose up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

Write-Host "==> docker compose ps"
docker compose ps

Write-Host "==> prisma validate"
npx.cmd prisma validate
if ($LASTEXITCODE -ne 0) { throw "prisma validate failed" }

Write-Host "==> prisma migrate deploy"
npx.cmd prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
  Write-Host "migrate deploy failed; trying migrate dev --name init_news"
  npx.cmd prisma migrate dev --name init_news
  if ($LASTEXITCODE -ne 0) { throw "prisma migrate failed" }
}

Write-Host "==> prisma generate"
npx.cmd prisma generate
if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

Write-Host "==> prisma db seed"
npx.cmd prisma db seed
if ($LASTEXITCODE -ne 0) { throw "prisma db seed failed" }

Write-Host "==> data checks"
npx.cmd tsx -e @"
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const cats = await p.category.count();
const bad = await p.category.findMany({ where: { slug: { in: ['overview', 'toan-canh'] } } });
const featured = await p.article.count({ where: { isFeatured: true, isPublished: true } });
const unpublished = await p.article.count({ where: { isPublished: false } });
const bySlug = await p.category.findMany({
  orderBy: { sortOrder: 'asc' },
  select: {
    slug: true,
    _count: { select: { articles: { where: { isPublished: true } } } },
  },
});
const maxPublished = Math.max(...bySlug.map((c) => c._count.articles));
const minPublished = Math.min(...bySlug.map((c) => c._count.articles));
console.log(JSON.stringify({ cats, bad, featured, unpublished, bySlug, maxPublished, minPublished }, null, 2));
if (cats !== 6) throw new Error('Expected 6 categories');
if (bad.length) throw new Error('Overview/toan-canh category present');
if (featured <= 1) throw new Error('Need featured > 1');
if (maxPublished <= 10) throw new Error('Need one category with >10 published');
if (minPublished < 3) throw new Error('Need >=3 published per category');
if (unpublished < 1) throw new Error('Need at least one unpublished article');
await p.`$disconnect();
console.log('ALL DATA CHECKS PASSED');
"@

Write-Host "==> SVG files"
@(
  "apps\web\public\images\news\placeholder-01.svg",
  "apps\web\public\images\news\placeholder-02.svg",
  "apps\web\public\images\news\placeholder-03.svg",
  "apps\web\public\images\news\placeholder-default.svg"
) | ForEach-Object {
  if (-not (Test-Path $_)) { throw "Missing $_" }
  Write-Host "OK $_"
}

Write-Host "Phase 3 apply + verify COMPLETE"
