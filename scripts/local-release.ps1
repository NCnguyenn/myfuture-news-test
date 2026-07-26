#Requires -Version 5.1
# Reusable feature-branch verification and push helper.
# It never stages, commits, merges, or force-pushes.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host '== git status =='
git status --short
$currentBranch = git branch --show-current
if ($LASTEXITCODE -ne 0) { throw 'Unable to determine the current branch.' }
if (-not $currentBranch.StartsWith('codex/')) {
  throw "Refusing to push unexpected branch: $currentBranch"
}
Write-Host "Branch: $currentBranch"
git log --oneline --decorate -10
git fetch --all --prune
if ($LASTEXITCODE -ne 0) { throw "git fetch failed with $LASTEXITCODE" }
git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed with $LASTEXITCODE" }

Write-Host '== quality gates =='
npm run check
if ($LASTEXITCODE -ne 0) { throw "npm run check failed with $LASTEXITCODE" }

if (git status --porcelain) {
  throw 'Worktree is not clean. Commit reviewed changes before pushing.'
}

Write-Host '== push feature branch (no force) =='
git push -u origin HEAD
if ($LASTEXITCODE -ne 0) { throw "git push failed with $LASTEXITCODE" }
git status --short
git log --oneline --decorate -5
Write-Host 'Done. Wait for CI, then deploy API before web and run smoke:production.'
