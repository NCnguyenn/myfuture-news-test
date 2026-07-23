# Phase 3 apply + verify (Windows PowerShell)
# Run from repo root:  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\phase3-apply-and-verify.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
$ComposeFile = "infrastructure\docker-compose.yml"
$PrismaSchema = "apps\backend\prisma\schema.prisma"

Write-Host "==> npm.cmd install"
npm.cmd install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "==> docker compose up -d"
docker compose -f $ComposeFile up -d
if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }

Write-Host "==> docker compose ps"
docker compose -f $ComposeFile ps

Write-Host "==> prisma validate"
npx.cmd prisma validate --schema $PrismaSchema
if ($LASTEXITCODE -ne 0) { throw "prisma validate failed" }

Write-Host "==> prisma migrate deploy"
npx.cmd prisma migrate deploy --schema $PrismaSchema
if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }

Write-Host "==> prisma generate"
npx.cmd prisma generate --schema $PrismaSchema
if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

Write-Host "==> prisma db seed"
npx.cmd prisma db seed --schema $PrismaSchema
if ($LASTEXITCODE -ne 0) { throw "prisma db seed failed" }

Write-Host "==> data checks"
npx.cmd tsx -e @"
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const categories = await p.category.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: 'asc' },
  select: {
    slug: true,
    _count: { select: { articles: { where: { isPublished: true } } } },
  },
});
const published = await p.article.count({ where: { isPublished: true } });
const officialPerCategory = categories.map((category) => ({
  slug: category.slug,
  published: category._count.articles,
}));
console.log(JSON.stringify({ published, officialPerCategory }, null, 2));
if (categories.length !== 6) throw new Error('Expected 6 active categories');
if (published !== 30) throw new Error('Expected exactly 30 published articles');
if (officialPerCategory.some((item) => item.published !== 5)) {
  throw new Error('Expected exactly 5 published articles per category');
}
await p.`$disconnect();
console.log('ALL DATA CHECKS PASSED');
"@

Write-Host "==> SVG files"
@(
  "apps\frontend\public\images\news\placeholder-01.svg",
  "apps\frontend\public\images\news\placeholder-02.svg",
  "apps\frontend\public\images\news\placeholder-03.svg",
  "apps\frontend\public\images\news\placeholder-default.svg"
) | ForEach-Object {
  if (-not (Test-Path $_)) { throw "Missing $_" }
  Write-Host "OK $_"
}

Write-Host "Phase 3 apply + verify COMPLETE"
