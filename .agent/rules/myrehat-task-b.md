---

## trigger: always_on

Read the full assessment instructions in `D:\Programming\Work Project\myRehat\myRehat_task.txt` and perform a complete status audit of my project in `D:\Programming\Work Project\myRehat\myrehat-task-b`.

Execute the following checks without modifying destructive state, and report a checklist of what is DONE vs. MISSING:
1. **Audit 5 Mandatory Dokploy Patches:**
   - Patch 1: Check `apps/web/.env` and `apps/server/.env` exist, contain only the required placeholder values, and are tracked by Git (`git ls-files apps/web/.env apps/server/.env`).
   - Patch 2: Check `pnpm-workspace.yaml` contains `msgpackr-extract: true` under `allowBuilds:`.
   - Patch 3: Check `docker-compose.yml` has NO `ports:` blocks, uses `${NEXT_PUBLIC_SERVER_URL:-http://server:3000}`, and includes the required `OPENROUTER_*`, `DATABASE_URL`, and `BETTER_AUTH_*` environment variables.
   - Patch 4: Check `apps/web/next.config.ts` has `rewrites()` for `/rpc/:path*` and `/api/auth/:path*` (plus check if `/api/webhooks/:path*` is needed) pointing to `http://server:3000`.
   - Patch 5: Check `packages/auth/src/index.ts` sets `defaultCookieAttributes` to `sameSite: "lax"` and `secure: false`.

2. **Introspect Remote PostgreSQL Schema (Read-Only):**
   - Connect to the evaluator's laptop database URL specified in `myRehat_task.txt` (`postgresql://taskb9:2d326034f6b7e74c47@34.21.153.205:5441/taskb9`).
   - Query `information_schema.columns` for all tables in the `public` schema and compare them against our local Drizzle schema in `packages/db`. Do NOT run `db:push` yet—just show me the exact columns of the remote `listing` and `auth` tables vs. local files.

3. **Audit Features F1, F2, F3, F4 & Tests:**
   - **F1:** Check if the Drizzle schema, oRPC procedures (protected create + public list), Zod 4-category enum (`Buy Property`, `Buy land to build homestay`, `Buy Airbnb Profile`, `Buy Airbnb Business`), and BuyHomestay UI form/list exist.
   - **F2:** Check if `POST /api/webhooks/waha` exists, validates `{ event, payload: { from, body } }`, calls `generateText` with OpenRouter, and returns `{ to, reply }`.
   - **F3:** Check if `scripts/polish.ts` exists and uses `ai-sdk-provider-opencode-sdk`.
   - **F4:** Check if the hero heading in `apps/web` matches `Book homestays directly with hosts` and is mobile-responsive.
   - **Tests:** Check existing Vitest test files and TypeScript status.

After completing this audit, provide a structured summary table and automatically log this audit entry into `D:\Programming\Work Project\myRehat\PROMPT_LOG.md`.
