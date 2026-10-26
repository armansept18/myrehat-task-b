---

## trigger: always_on

Run a full end-to-end verification and testing suite for Task B against all requirements in `D:\Programming\Work Project\myRehat\myRehat_task.txt`.

Perform these 6 verification steps in order and fix any failures found:
1. **Database Schema Sync Check (Must be No-Op):**
   - Run `pnpm db:push` inside `packages/db` using `DATABASE_URL="postgresql://taskb9:2d326034f6b7e74c47@34.21.153.205:5441/taskb9"`.
   - Verify that our local Drizzle schema matches the remote database so closely that `db:push` requires zero destructive changes (no-op).

2. **Vitest Unit Test Suite (`bunx vitest run`):**
   - Run `bunx vitest run` and ensure 100% of tests pass green.
   - Verify that our test suite explicitly covers:
     a) WAHA webhook payload validation (accepts valid `{ event, payload: { from, body } }`, rejects invalid/missing fields with 400).
     b) Listing category validation: all 4 exact categories (`"Buy Property"`, `"Buy land to build homestay"`, `"Buy Airbnb Profile"`, `"Buy Airbnb Business"`) pass validation, and at least 1 invalid category is rejected.
     c) WAHA webhook response format returns `{ to, reply }`.
     d) Unit test with mock for `scripts/polish.ts` verifying integration with `ai-sdk-provider-opencode-sdk`.

3. **TypeScript & Build Check (`tsc`):**
   - Run `pnpm check-types` (or `tsc --noEmit` across all workspaces) and verify there are 0 TypeScript errors.

4. **UI & Endpoint Routing Verification:**
   - Verify the hero heading in `apps/web` contains the exact string: `Book homestays directly with hosts`.
   - Verify that `POST /api/webhooks/waha` is reachable from the Next.js web app URL (either via Next.js App Router route handler or via `next.config.ts` rewrite to Elysia).

5. **Git Security & Mandatory Patch Audit:**
   - Run `git status` and `git diff` to guarantee NO real `DATABASE_URL` or real API keys were written to `apps/web/.env`, `apps/server/.env`, or any tracked file.
   - Confirm all 5 mandatory Dokploy patches remain intact.

6. **Update Prompt Log:**
   - Append the complete test execution output (`bunx vitest run` results, `tsc` check, and `db:push` status) to `D:\Programming\Work Project\myRehat\PROMPT_LOG.md`.
