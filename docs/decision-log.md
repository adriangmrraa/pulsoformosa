# C1 Decision Log — `scaffold-ui-shell`

Iteration 1 of the SDD plan (§26). Scope: two public routes (`/`, `/reportar`),
the `/api/overview` read path, the §15.11 contract seed, and the full
lint/typecheck/unit/e2e/CI harness.

## Product decisions

| # | Decision | Rationale |
|---|---|---|
| DEC-01 | `IncidentMap` is a fixed-height server section mounting a client placeholder (`map-libre-mount.tsx`). No tile config in props. | Keeps the C1B-b MapLibre swap prop-stable and avoids CLS; tiles/PMTiles are explicitly out of scope (§9.7, §9.9). |
| DEC-02 | Production gate returns a JSON `404` with the uniform §17.9 body from `/api/overview`. | An API route should not render the HTML 404 page; a redirect would reveal that the route exists. |
| DEC-03 | `/` reads overview data through a server-side `fetch` to `/api/overview`, with origin derived from `headers()` and a `127.0.0.1:$PORT` fallback. | Demonstrates the real HTTP read path without an environment dependency; fetch failures degrade to `AsyncState` and never throw. |
| DEC-04 | `FORMOSA_BBOX = {-62.70, -26.42, -57.60, -21.70}` with 15 km tolerance, documented as OSM relation 153554 extent. | Conservative UX hint only; server-side polygon validation lands in C2. |
| DEC-05 | The report list is provider-direct in the server component. No `/api/reports` route exists in C1. | Only `/api/overview` is in scope; the reports API lands with C2. |
| DEC-06 | Cards are server `<a>` deep links; sharing is a small client island; pagination is a server anchor. | Server-first (§9.7), native deep links, no client fetch for lists. |
| DEC-07 | Inter via `next/font/google`, `--font-sans`, tabular numerals for metrics. | OFL-licensed, mature tabular figures and es-AR glyph coverage. |
| DEC-08 | Footer legal info uses `<details>` disclosures instead of dialogs. | Zero-JS progressive enhancement; no extra routes. |
| DEC-09 | CI includes a blocking `gitleaks` job. | Secret scanning at scaffold time, no secrets required. |
| DEC-10 | Dark-only palette in C1 (`color-scheme: dark`), §8.3 hex values flagged for contrast verification. | Ships a coherent system without an unverified light-contrast matrix. |
| DEC-11 | Baseline security headers only; nonce-CSP deferred to C6. | A premature CSP needs Turnstile/map allowlists that do not exist yet. |
| DEC-12 | “Reportar contenido inadecuado” is absent in C1. | The flag endpoint is C5; a dead affordance adds noise and false expectations. |
| DEC-13 | Fixture reports ship `photos: []` and a labelled “sin foto” block. | Anti-invention rule: no invented imagery. |
| DEC-14 | Vitest defaults to jsdom; pure-domain suites use `// @vitest-environment node`. | Deterministic per-file environments with minimal config. |
| DEC-15 | `lib/api-error.ts` emits `request_id` and a structured `console.error` line. | Minimal observability seam needed by the error contract; full observability is C6. |
| DEC-16 | `mobile-webkit` stays mandatory; chromium projects remain the baseline if webkit flakes. | §28.3 Android/iOS coverage. |
| DEC-17 | Playwright writes screenshots into `test-results/snapshots/` as artifacts, not visual baselines. | Baselines are brittle at scaffold; AC-04 asks for capture. |
| DEC-18 | `.env.example` is a skeleton of placeholders; C0 owns completion. | Joint ownership; only `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is public. |

## Implemented deviations (owner override)

1. **Real database seam (supersedes XCL-01 for C1).** `lib/db/index.ts` ships a
   lazy `@neondatabase/serverless` + `drizzle-orm` client and `lib/db/health.ts`
   probes `select 1`. `drizzle.config.ts` and `db:generate` / `db:migrate`
   scripts exist. No schema, migration or table is created yet (C2).
2. **`subtipo` query parameter.** The water-subtype chips write `?subtipo=`.
   The canonical grammar (§4) did not name this parameter; it is additive and
   still parsed by the strict, forgiving query parser.
3. **Extra unit test.** `tests/unit/db-seam.test.ts` travels with deviation 1,
   so the final count is 25 test/fixture files instead of the spec'd 24.
4. **Hand-adjusted generated primitives.** `base-nova` primitives were generated
   with the shadcn CLI, then their `cn` import was pointed at `@/lib/utils`,
   English “Close” copy was localized, and a `--color-base` token collision
   (`text-base` font-size vs color) was resolved by renaming the token to
   `--color-navy`.

## Deferred decisions (DA)

- **DA-01** Brand/domain: `Pulso Formosa` is a single constant pending approval.
- **DA-06/13/15** Cartography provider, coverage and attribution: C1B-b.
- **DA-08/DA-09** Legal/privacy text and contacts: marked `pending-owner` in the
  footer.
- Light palette and measured contrast ratios: before launch.
- CSP nonce strategy: C6.

## Risk mitigations (R1–R10)

- **R1 Next 16/React 19 drift** — read `node_modules/next/dist/docs/` before
  routing work; async `searchParams`/`headers()` used as documented; page is
  `force-dynamic`.
- **R2 Tailwind v4 config-less** — `@import "tailwindcss"` + `@theme` only, no
  `tailwind.config`.
- **R3 base-nova availability** — CLI generation succeeded; imports and copy
  were normalized.
- **R4 build-time self-fetch** — `force-dynamic`; fetch failures render an
  error state.
- **R5 Windows port handling** — README documents `netstat`/`taskkill` by PID.
- **R6 webkit flake** — webkit passed locally; chromium remains mandatory.
- **R7 mock leakage** — double gate (provider throws + route 404), visible badge,
  e2e badge assertion and fixture contract tests.
- **R8 Zod v4 drift** — v4 idioms (`strictObject`, `z.uuid()`) with unit tests.
- **R9 font ambiguity** — Inter chosen and verified at build time.
- **R10 fixture realism** — `mock://` URLs, `rpt_mock_*` ids, `captured_at`
  markers, no photos, explicit “no corresponde a un hecho real” copy.

## Verification

- `npm test` — 16 files / 90 tests green.
- `npm run typecheck`, `npm run lint`, `npm run build` — green.
- `npm run e2e` — 45 tests green across desktop-chromium, mobile-webkit and
  mobile-chromium against a production build (gated on a hydration marker).
- Axe: 0 serious/critical on both routes.
- Route tree: `/`, `/reportar`, `/api/overview` only (plus framework
  `not-found`/icon).
- No MapLibre, PMTiles or tile imports.
- No secrets tracked; `.env.local` stays ignored.
