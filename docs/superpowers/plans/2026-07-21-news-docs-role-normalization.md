# News Documentation and AI Team Lead Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the five News module Markdown documents and create an English AI team-lead role file that can audit progress and generate English execution prompts only when explicitly requested.

**Architecture:** Keep the existing Next.js/NestJS/Fastify/PostgreSQL/Prisma/Redis architecture. Treat the recruiter brief as the source of truth, define the seven UI tabs as one aggregate Overview plus six database Categories, and use Redis cache-aside without a queue because no asynchronous business use case exists.

**Tech Stack:** Markdown documentation, PowerShell verification, Next.js, React, NestJS, Fastify, PostgreSQL, Prisma, Redis.

## Global Constraints

- The recruiter brief defines the required product scope; project-specific decisions must be labeled as assumptions or implementation choices.
- Normal conversation with the user is Vietnamese.
- Generated delegation prompts are English and are produced only after an explicit user request.
- Prompt skill references use paths under `D:\Antigravity-Skills-Library\antigravity-awesome-skills`.
- Redis is required for cache-aside read APIs; no queue is added without a concrete asynchronous use case.
- No secrets, credentials, external messages, or destructive actions are introduced.

### Task 1: Normalize the project specification

**Files:**
- Modify: `D:\Personal_Project\myfuture-news-test\md\01-PROJECT-SPEC.md`

**Interfaces:**
- Produces the authoritative product scope, requirement priority, route policy, Redis decision, and detail-page contract used by the architecture and implementation plan.

- [ ] Mark recruiter requirements separately from implementation decisions.
- [ ] Define the core News MVP and explicitly classify non-core live-site sections as out of scope for this test.
- [ ] Resolve Overview naming, route policy, detail must-haves, local seed images, and cache-only Redis.
- [ ] Add an assumptions section for unresolved recruiter details.

### Task 2: Align architecture and API/data contracts

**Files:**
- Modify: `D:\Personal_Project\myfuture-news-test\md\02-TECHNICAL-ARCHITECTURE.md`

**Interfaces:**
- Produces the API, Prisma, routing, cache, error, and frontend contracts consumed by the implementation plan and checklist.

- [ ] Make Overview a documented UI configuration item rather than an API Category.
- [ ] Freeze routes, API prefix, pagination behavior, response envelopes, error shape, and detail payload priority.
- [ ] Replace remote image examples with local placeholder paths.
- [ ] Resolve tags, related articles, previous/next, empty-state fixtures, and Redis cache-only behavior.

### Task 3: Align execution plan, checklist, and progress rules

**Files:**
- Modify: `D:\Personal_Project\myfuture-news-test\md\03-IMPLEMENTATION-PLAN.md`
- Modify: `D:\Personal_Project\myfuture-news-test\md\04-TEST-CHECKLIST.md`
- Modify: `D:\Personal_Project\myfuture-news-test\md\05-PROGRESS.md`

**Interfaces:**
- Produces an executable plan whose acceptance checks use the same contract as Tasks 1–2.

- [ ] Label MVP, recommended, and optional work consistently.
- [ ] Change empty-category verification to use a fixture or temporary test data rather than contradicting the seed requirements.
- [ ] Add explicit cache-only Redis rationale and remove unresolved “page overflow” language.
- [ ] Add a documentation audit checkpoint before scaffold and keep progress evidence-based.

### Task 4: Create the AI team-lead role document

**Files:**
- Create: `D:\Personal_Project\myfuture-news-test\role\AI-NEWS-TEAM-LEAD.md`

**Interfaces:**
- Produces an English operating contract for any AI that must audit the repository, discuss progress in Vietnamese, coordinate named AI tools, and generate English prompts only on explicit request.

- [ ] Define authority hierarchy, scope guardrails, audit workflow, evidence rules, and status format.
- [ ] Define prompt-generation trigger and prompt template with skill paths.
- [ ] Define delegation protocol for Antigravity 2.0, Anti IDE, Codex, and Grok Build CLI.
- [ ] Define stop conditions, risk escalation, and no-autonomous-prompt rules.

### Task 5: Verify consistency

**Files:**
- Read: all files under `D:\Personal_Project\myfuture-news-test\md\` and `D:\Personal_Project\myfuture-news-test\role\`

- [ ] Confirm the five Markdown files and the role file exist.
- [ ] Search for contradictory terms and verify each occurrence is either resolved or explicitly labeled as optional/assumption.
- [ ] Verify no placeholder markers, real secrets, or unintended queue requirements remain.
- [ ] Record the final changed-file summary for the user.
