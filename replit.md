# NullTrace

AI-powered DevOps observability platform — incident intelligence, real-time log streaming, root cause analysis, and service health monitoring.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (Neon)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v4 + shadcn/ui + Wouter
- API: Express 5
- DB: PostgreSQL (Neon) + Drizzle ORM
- Auth: Clerk (via Replit Clerk whitelabel)
- AI: Groq SDK (llama-3.3-70b-versatile / llama-3.1-8b-instant)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nulltrace/` — React frontend
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod schemas

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed hooks + Zod schemas
- Clerk auth: protected routes via `<Show when="signed-in">` + Redirect; Clerk proxy middleware on Express for custom domain support
- RCA is generated asynchronously (fire-and-forget after incident creation, re-runs on-demand from incident detail page)
- Tailwind v4 + Clerk: requires `@layer theme, base, clerk, components, utilities;` before tailwindcss import + `optimize: false` in vite plugin to avoid CSS layer conflicts
- Dark futuristic UI: glassmorphism + neon blue/purple accents (`glass-card`, `neon-border-blue`, `neon-border-purple` utility classes)

## Product

- **Landing page**: public marketing page with "Enter Dashboard" (requires auth)
- **Dashboard**: health score overview, active incident feed, service status, log activity
- **Incidents**: list with severity badges; detail page has auto-triggered AI root cause analysis
- **Logs**: live-streaming log viewer with search/filter, level badges, anomaly highlighting
- **Services**: service health and dependency map
- **Metrics**: CPU, memory, latency charts
- **AI Chat**: conversational DevOps assistant (Groq Llama 3.3-70B)
- **Team**: on-call roster management

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT add `@layer clerk` manually in Tailwind — the `@layer theme, base, clerk, components, utilities;` declaration in index.css handles Clerk's CSS layer order
- After changing `lib/api-spec`, always run `pnpm --filter @workspace/api-spec run codegen` before typechecking
- `pnpm run typecheck` uses project references — run it from the root, not inside individual packages
- The monitoring simulate endpoint fires RCA asynchronously; the incident is returned immediately (no RCA yet), and the detail page auto-re-fetches until rootCause is populated

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk setup details
