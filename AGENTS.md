# AGENTS.md — Pulso Formosa (working name: AGUA FORMOSA)

Public civic-reporting site for the province of Formosa, Argentina. Source of truth:
`docs/product-spec-master.md` (v1.1, 2026-10-20). SDD persistence: **engram** (no openspec/).

## Product boundaries (binding — spec §0)

- Exactly TWO public routes: `/` (observe: ENSO, rain, river, citizen reports) and `/reportar` (anonymous incident report). Internal `/api/*` endpoints and private admin tooling are allowed; no extra public pages, no public login, no chat/feed/voting.
- Anonymous reporting: no accounts for citizens. Moderators use private tooling only (CLI or isolated admin service) — never `/api/admin?action=...&secret=...`.
- Never merge observed data, forecasts, citizen reports and editorial verification into one confidence level. Every climate figure carries variable + unit + timeframe + source.
- Locale: es-AR (Rioplatense copy), timezone `America/Argentina/Buenos_Aires`, UTC in persistence, metric units.

## Verified stack (evidence-based, not guessed)

Derived from spec §14.1 and cross-validated against tracked references
`references/muzapp` (Neon+Drizzle Next.js convention) and `references/dentalogic`
(testing/CI/UI convention):

| Layer | Choice | Evidence |
|-------|--------|----------|
| Framework | Next.js 16.x App Router + React 19 + TypeScript strict | spec §14.1; muzapp `next 16.2.4`/`react 19.2.4`; dentalogic `next ^16.2.12`/`react ^19.2.8` |
| UI | Tailwind CSS v4 (`@tailwindcss/postcss`, no tailwind.config) + shadcn/ui (`components.json` style `base-nova`, base-ui primitives) + `cn()` = clsx + tailwind-merge | both refs' package.json + components.json |
| Icons | `lucide-react` ONLY — never Material Icons / Font Awesome / heroicons | dentalogic AGENTS.md + package.json |
| Maps | MapLibre GL JS + PMTiles basemap (Protomaps/Planetiler) served from object storage/CDN with HTTP Range + CORS | spec §14.7; never `tile.openstreetmap.org` for load, never Nominatim public for autocomplete |
| DB | Neon PostgreSQL via `@neondatabase/serverless` + `drizzle-orm`; `neon(url)` + `drizzle(sql, { schema })` factory in `src/db` | spec §14.1/§16; muzapp `src/db/index.ts` (`createDb`), `drizzle.config.ts` |
| Migrations | `drizzle-kit generate`/`migrate` into `drizzle/` — never uncontrolled `db push` in production | spec §16.6; muzapp scripts `db:generate`/`db:migrate` |
| Geospatial | PostGIS **only if** Neon supports and it is validated enabled; otherwise `DOUBLE PRECISION` + bbox queries with planned migration | spec §14.1/§16.2 |
| Validation | `zod` v4 strict parse on every external input, reject unknown props | spec §19.3; both refs (`zod ^4.4.3`) |
| Anti-abuse | Cloudflare Turnstile server-verified + persistent rate limit (Upstash Redis, never in-memory `Map` in serverless) + Vercel WAF when applicable | spec §19.4; muzapp `@upstash/ratelimit`+`@upstash/redis` |
| Media | Private object storage (Vercel Blob private / S3 / R2): upload-intent → quarantine → sanitize (magic bytes, re-encode, strip EXIF/GPS) → publish | spec §18 |
| Testing | Vitest + Testing Library + Playwright + axe-core; v8 coverage | spec §14.1; dentalogic `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml` |
| Lint/format | ESLint 9 flat config `eslint-config-next` core-web-vitals + typescript; `tsc --noEmit` typecheck | both refs `eslint.config.mjs` + scripts |
| Runtime | Node 20 LTS minimum (`.nvmrc` 22 in dentalogic; engines `>=20.9.0`) | dentalogic `.nvmrc`/engines/ci.yml |
| Package manager | npm (`package-lock.json` in muzapp; dentalogic CI uses `npm ci`) | refs |
| CI | GitHub Actions: lint → typecheck → vitest → build; Playwright e2e job | dentalogic `ci.yml` |

## Commands (projected at scaffold — verify once bootstrapped)

```bash
npm run dev          # next dev
npm run build        # production build — must pass
npm run lint         # eslint flat config
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:coverage# vitest run --coverage
npm run e2e          # playwright test (production build, never dev server)
npm run db:generate  # drizzle-kit generate
npm run db:migrate   # drizzle-kit migrate
```

## Verification gates (before claiming work is done)

1. `npm test` / `npm run test:agents` equivalent
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. E2E only against a production build (`build` + `start`), never `next dev` — dev servers break hydration and produce false failures. Free the port by PID on Windows before reusing (`netstat -ano | findstr :PORT`, `taskkill //PID <pid> //F //T`).

## Layout (spec §23 — do not create empty folders)

```
app/(public routes: page.tsx, reportar/page.tsx, api/*/route.ts)
components/{home,map,reports,climate,ui}
lib/{db,providers,domain,security,maps,cache,validation}
jobs/  scripts/  drizzle/  tests/{unit,integration,e2e,fixtures}
docs/  .github/workflows/
```

Reference conventions worth copying verbatim: muzapp `src/db/index.ts` factory,
muzapp route groups `(admin)`/`(storefront)`, dentalogic 4-layer rule
PRESENTATION → DOMAIN (`src/modules/<domain>`) → DATA ACCESS → INFRASTRUCTURE.

## Non-negotiables

- **Never invent data** — no fake stats, incidents, credentials, API permissions or weather estimates. Dev mocks must be visibly marked and never served in production.
- **Never put `DATABASE_URL` (or any secret) in code, logs, or commits.** `.env.example` is the only tracked env file; placeholders only. `NEXT_PUBLIC_` only for true public values (Turnstile site key).
- **No direct Postgres access from the browser.** Public reads via read-limited role/views; writes only from privileged backend.
- Zod-validate every API input; parameterized SQL only; server-side authorization per endpoint; SSRF allowlist for outbound fetch.
- Uploaded files: never trust extension/MIME — inspect magic bytes, re-encode, strip EXIF/GPS, cap pixels (decompression-bomb guard), serve sanitized variants with `nosniff`.
- Tests travel with the behavior they verify in the same commit. Conventional commits only; never `Co-Authored-By` or AI attribution.
- OSM attribution "© OpenStreetMap contributors" + ODbL review before deriving datasets; cartography base stays separate from citizen-report data.
- i18n/units: es-AR UI; `es-AR` locale and `America/Argentina/Buenos_Aires` in Playwright config; UTC persisted.
- Deployment is a dedicated later phase — do not configure it here.

## SDD state

- Mode: `engram`. Project context: `sdd-init/pulsoformosa`; testing capabilities: `sdd/pulsoformosa/testing-capabilities`; registry: `skill-registry` (and `.atl/skill-registry.md`).
- Strict TDD: **enabled (prescribed)** — spec §14.1 prescribes the runner and §26 gates every iteration on tests; re-verify detection after scaffold lands.
