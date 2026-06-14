# CarbonEra

A scroll-driven, AI-powered carbon footprint awareness web app built for a Google PromptWars competition. Users take a lifestyle quiz, get their personal CO₂ footprint score, read an AI-generated climate story about their city, make a pledge, download a shareable Carbon Card, and see where their city ranks on a leaderboard.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/carbonera run dev` — run the frontend (port 18182, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + GSAP + shadcn/ui + Wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (`submissions.ts`, `pledges.ts`)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/carbonera/src/components/` — all React UI components
- `artifacts/carbonera/src/lib/emissions.ts` — carbon footprint calculation logic
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do not edit)

## Architecture decisions

- Contract-first: OpenAPI spec drives all codegen; never hand-write API types.
- Story generation is template-based (no LLM) — uses real CO₂ math and contextual prose; can be swapped for an LLM call later.
- `/api/live` endpoint caches CO₂ data for 5 minutes to avoid rate limits; falls back to static values if no CO2_SIGNAL_API_KEY is set.
- All sections are scroll-driven and progressively revealed — quiz results unlock after quiz completion, story unlocks after results, etc.

## Product

- **Hero**: Full-screen spotlight reveal with cursor tracking — pollution/nature image duality.
- **History Scroll**: GSAP ScrollTrigger timeline of CO₂ milestones from 1750 to 2024.
- **Live Stats**: Real-time (cached) atmospheric CO₂ ppm and India grid intensity.
- **Quiz**: 5-step lifestyle questionnaire (city, diet, transport, energy, flights).
- **Footprint Result**: Personal CO₂ score with comparisons to India average, Paris target, global average.
- **AI Story**: 3-paragraph typewriter-animated climate narrative generated from quiz data.
- **Pledge + Carbon Card**: Pledge selection with downloadable/shareable PNG card.
- **Leaderboard**: City rankings by average per-capita footprint.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing any `lib/*` package before running leaf artifact typechecks — stale declarations cause false TS2305 errors.
- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before typechecking the frontend.
- gsap and html-to-image must be installed in the `@workspace/carbonera` package directly (not just declared in the workspace catalog).
- The `CO2_SIGNAL_API_KEY` env var is optional — without it, `/api/live` returns a plausible static value.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
