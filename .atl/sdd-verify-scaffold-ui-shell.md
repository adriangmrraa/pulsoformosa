# SDD Verify — `scaffold-ui-shell`

- **Change**: `scaffold-ui-shell` (C1 · spec §26 Iteration 1)
- **Worktree**: `C:\Users\Asus\orca\workspaces\pulsoformosa\sdd-verify`, branch `sdd-verify`, HEAD `dee550c`
- **Baseline**: `b0c9392` (SDD context only)
- **Diff reviewed**: 17 commits, 113 files, 17,512 insertions
- **Reviewer mode**: independent / adversarial, read-only for project code
- **Environment**: Windows, Node `v22.17.0`, npm `10.8.2`; `.env.local` present with `PUBLIC_ENVIRONMENT_LABEL` non-production and a real `DATABASE_URL` (value never printed, file never committed)
- **Inputs used**: `.atl/obs-5541` (spec), `.atl/obs-5546` (design), `.atl/obs-5547` (tasks), `AGENTS.md`, `docs/product-spec-master.md`, reference repos

## Verdict

**PASS-WITH-WARNINGS**

All executable gates are green, there are no tracked credentials, and the two-route/mock-gate architecture is correct. The build nevertheless ships several non-blocking but real gaps: one user-facing filter bug, incomplete §9.6/§5.5 state coverage, a hidden-report rendering path that leaks content if such a status ever reaches it, an SSRF-prone self-fetch origin, a wrong `/reportar` canonical, and a critical Next.js advisory. No CRITICAL secret/data breach was found, so this is not `REPAIR-REQUIRED` for merge; the warnings marked “fix before C2/deploy” must be closed before the next iteration and before any deployment.

Counts: **0 CRITICAL · 12 WARNING · 9 SUGGESTION**

---

## 1. Findings

### CRITICAL

None.

- No real credentials, tokens, API keys or connection strings were found in tracked files.
- `.env.local` is untracked and ignored by git; it never appears in history.
- All gates (`lint`, `typecheck`, `test`, `build`, `e2e`, coverage) exit 0.
- Production gate was exercised against a real production server and returned the required 404.

### WARNING

**W-01 — Next.js 16.2.12 carries a critical advisory (patch before deployment).**
Evidence: `package.json` pins `"next": "16.2.12"`; `npm audit --json` reports `1 critical, 7 high, 4 moderate, 0 low`. The critical entry is `next` (unauthenticated RCE on Windows-hosted servers, Image Optimization API RCE with AVIF, `next/og` RCE); npm reports fix version `16.4.2` (`isSemVerMajor: false`). The current app does not use the image optimizer or `next/og`, and deployment is deferred, but the dependency itself must be bumped before any deploy. The high advisories are mostly dev-only `eslint-config-next`/`postcss`/`sharp` transitives.
Action: bump `next` to `>=16.4.2` (and align `eslint-config-next`), re-run all gates.

**W-02 — Category switch leaves a stale `subtipo` query parameter and can empty the list.**
Evidence: `components/home/filter-chips.tsx:20-38`. `selectCategory` calls `updateParam("subtipo", null)` and then `updateParam("categoria", ...)`. Both calls build from the same `useSearchParams()` snapshot, so the second `router.replace` re-adds the old `subtipo`. Example: from `?categoria=agua&subtipo=calle+anegada` click “Calles” → final URL `?categoria=calles&subtipo=calle+anegada`; `lib/providers/mock.ts:35-47` then filters ROADS by a WATER subtype and returns zero cards. This breaks the category filter after a subtype was selected (REQ-BND-05 / REQ-IA-06 / AC-10).
Action: build one `URLSearchParams`, apply all mutations once, then call `router.replace` once. Add an integration test for the agua+subtype → calles transition.

**W-03 — §9.6 state coverage is incomplete: `partial` is rendered as success and `Uploading` is absent.**
Evidence: `lib/domain/async-state.ts:8-12` declares `partial`; all cards cast `state.data` straight through (`components/climate/climate-context-card.tsx:17-23`, `weather-preview.tsx:15-20`, `river-level-card.tsx:26-31`, `components/home/community-snapshot.tsx:26-31`) and never render `missing[]` or a partial notice. `components/reports/image-uploader.tsx` has preview/remove/count but no uploading state. `tests/integration/states.test.tsx` covers loading/error/stale/empty for some cards but has no `partial` or `offline` test. This is a direct PARTIAL for AC-11 / REQ-BND-04.
Action: add a partial notice (or explicit missing-field rendering), an uploading state for the uploader, and tests for every state named in the §3 contracts.

**W-04 — Stale-past-freshness behavior is not implemented; “Esperando actualización” is dead copy.**
Evidence: `lib/domain/staleness.ts` is never imported by UI code; `lib/domain/microcopy.ts:35` defines `WAITING_UPDATE = "Esperando actualización"` but grep finds no consumer. `components/climate/data-stale-notice.tsx:8` only defaults to `STALE_NOTICE`; cards never pass a label or `since`. §5.5/§15.9 require that after the freshness window the last number is hidden and “Esperando actualización” is shown. Currently the UI relies entirely on the provider’s `is_stale` boolean, which fixtures always set to `false`.
Action: wire `isStaleFor`/freshness windows into the cards and render `WAITING_UPDATE` when the window is exceeded; add tests.

**W-05 — Hidden/Rejected report content is rendered in the detail sheet and the mock provider does not enforce public-only reads.**
Evidence: `components/reports/incident-detail-sheet.tsx:79-86` shows “Este reporte no está disponible públicamente.” for `HIDDEN`/`REJECTED`, then continues rendering `report.description`, timestamps, zone, sources and photo count. `lib/providers/mock.ts:113-115` compares `getReportById` only by `id`; `filteredReports` does not exclude non-public editorial statuses either. C1 fixtures contain no `HIDDEN`/`REJECTED` records, so this is not currently exploitable, but the code path violates §17.3/§25 (“hidden link shows No disponible; photos no longer served”) and becomes a data leak as soon as C2/C5 feed such records.
Action: return `null` (or a public-only projection) for non-public statuses in the provider, and do not render detail fields for hidden/rejected reports.

**W-06 — Server-side self-fetch builds its origin from attacker-controllable request headers (SSRF risk).**
Evidence: `app/page.tsx:81-90` reads `host` and `x-forwarded-proto` from `headers()` and does `fetch(`${proto}://${host}/api/overview`)` with no allowlist. A spoofed `Host` header can point the server at an arbitrary internal host. `AGENTS.md` explicitly requires an SSRF allowlist for outbound fetch.
Action: use the configured `APP_BASE_URL` (or a validated host allowlist) for this internal read, or call the provider directly and keep the HTTP demonstration behind an explicit internal URL. Add a host validation test.

**W-07 — `/reportar` canonical points at `/`, and the canonical host falls back to localhost.**
Evidence: `app/layout.tsx:21-24` sets `metadataBase` from `APP_BASE_URL` and `alternates: { canonical: "/" }` at the root. Live response for `/reportar` (production server, local origin) contained `<link rel="canonical" href="http://127.0.0.1:3000"/>` — the same canonical as `/`. The page defines its own title/description but inherits the root `alternates`. This fails REQ-IA-10’s per-page canonical intent and would ship `localhost` canonicals if `APP_BASE_URL` is missing.
Action: set `alternates` per page (`/` and `/reportar`), and make `APP_BASE_URL` required in non-development environments.

**W-08 — GPS/location UX gaps: accuracy is dropped, outside-bbox GPS failure shows no visible error, and “Marcar en mapa” is absent.**
Evidence: `components/reports/report-form.tsx:205-210` passes an `onChange` that discards the third `accuracyM` argument, so `LocationPicker`’s accuracy display (`location-picker.tsx:109-111`) is never reached from the form. In the GPS success path (`location-picker.tsx:50-64`), an out-of-bbox point sets `outside` and returns without opening the manual panel; the `role="alert"` error is rendered only inside the `manualOpen` block (`location-picker.tsx:177`), so the user sees nothing. There is also no “Marcar en mapa” button required by the `LocationPicker` contract (REQ-FRM-03 / FRM-10 / §6.1c).
Action: store/pass accuracy, render the outside-region error outside the manual panel, and add the required manual-map affordance or explicitly document its C1 deferral.

**W-09 — Form contract gaps: idempotency key is generated and discarded; Turnstile stub does not read its env var.**
Evidence: `components/reports/report-form.tsx:133-137` creates `newKey()` only inside the local `candidate` used for `safeParse`; `handleSubmit` (`:144-166`) never builds or sends that payload, so no `idempotency_key` leaves the form (REQ-FRM-09). The anti-bot slot (`report-form.tsx:284`) renders `SUBMISSION_STUB_HINT` but never reads `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, contrary to REQ-FRM-06. The fake-submit behavior itself is correct and persists nothing.
Action: retain the generated key in the submit payload shape (even if the C1 submit is fake) and render/verify the placeholder site-key slot.

**W-10 — Image uploader silently drops invalid files and has no uploading/error UX.**
Evidence: `components/reports/image-uploader.tsx:39-42` filters unsupported MIME/size and slices to 3 without setting an error; the `error` prop exists but `ReportForm` never passes it. No uploading visual exists. §6.4 requires the cause to be explained and REQ-FRM-04 requires an uploading state.
Action: surface rejection reasons (type/size/count), pass an error from the form, and add the uploading visual.

**W-11 — Typography and touch targets are below the stated design contract.**
Evidence: `REQ-STY-03` requires metadata ≥13 px and body 15–17 px; the code uses `text-xs` (12 px) for repeated metadata (`components/ui/footer.tsx:67`, `components/reports/incident-card.tsx:50,57`, `components/reports/updated-at.tsx:10`, many others) and `text-[11px]` at `footer.tsx:9`; `text-sm` (14 px) is used for body disclaimers. `REQ-STY-06` requires 18–24 px icons but `DevMockBadge` uses 14 px and dialog/checkbox icons use 16 px. `REQ-STY-07` requires 44×44 targets; `components/ui/dialog.tsx:69` uses `size="icon-sm"` (28 px) and the checkbox/radio controls are 16 px with a pseudo hit area around ~40×32 px.
Action: raise metadata/body font sizes, enlarge icons to the required range, and give the dialog close and form controls a ≥44 px hit target. Add a target-size audit to e2e or visual checks.

**W-12 — “Para entenderlo rápido” uses default API filters, not the user’s active filters/period.**
Evidence: `app/api/overview/route.ts:37-41` always requests community stats with `CATEGORY_SLUGS[DEFAULT_CATEGORY]` (`ALL`) and `DEFAULT_PERIOD` (`7d`); `app/page.tsx:162-164` feeds that to `CommunitySnapshot` while the visible list uses the selected `categoria`/`periodo`. Selecting 24 h or a category therefore leaves the microsummary showing a 7-day/all-category count, which can contradict the list and §5.4’s “select period/category and get a persistent view” promise.
Action: pass the parsed query to the community-stats provider (or compute the summary from the same filtered result set) and add a test that changes period/category and asserts the summary changes.

### SUGGESTION

**S-01 — Dead or unused spec surfaces.** `components/reports/updated-at.tsx` is never imported; `EmptyState` ignores its specified `{title, body, cta}` props and hardcodes copy; `buildReportShareText()` is tested but unused by the UI; `staleness.ts` and `WAITING_UPDATE` are unused; `overviewQuerySchema` is exported but never used (`parseOverviewQuery` uses field schemas instead, so unknown props are ignored rather than strictly rejected). Six generated primitives (`accordion`, `badge`, `card`, `input`, `radio-group`, `sheet`) are unconsumed. Wire or delete them so “only consumed primitives” and the strict-schema claims are true.

**S-02 — Draft restore does not repopulate the manual coordinate inputs.** `LocationPicker` initializes `latText`/`lonText` only at mount (`location-picker.tsx:34-36`); a restored draft sets `value` later, so the preview shows a location while the manual inputs remain blank. Sync the text inputs when `value` changes.

**S-03 — The form can be resubmitted after a successful fake submit.** The guard is only `if (submission === "submitting")` (`report-form.tsx:146`); after `received`, the button re-enables. Consider keeping the confirmation state sticky until reset.

**S-04 — Stale comment contradicts tsconfig.** `vitest.config.ts:6-8` says tsconfig keeps Next’s `preserve` JSX mode, but `tsconfig.json:18` is `"react-jsx"`. Update the comment or the setting.

**S-05 — Environment/migration documentation drift.** `lib/site.ts:16` reads `NEXT_PUBLIC_APP_BASE_URL`, which is not in `.env.example`; `drizzle.config.ts` targets `./lib/db/schema.ts`, which does not exist (so `db:generate` will fail until C2). Document both as deferred/owner-override behavior.

**S-06 — Verification gaps for layout and deep links.** AC-04’s 1280 px wireframe validation is not represented (snapshots are 390/1440 only); no e2e exercises `?zona=`; the keyboard test only asserts focus remains in `<body>` (`tests/e2e/a11y.spec.ts:27-44`) rather than checking tab order/focus trap. Add a 1280 viewport check and a zona roundtrip.

**S-07 — Mock `mock://` links are clickable.** Source links and methodology links point to the `mock://` scheme, which browsers cannot resolve. Since the whole surface is visibly badged mock, this is cosmetic, but inert/disabled links would be cleaner in fixture mode.

**S-08 — Header duplicates the region label for screen readers.** `SiteHeader` renders the visible `RegionLabel` and also a `sr-only` copy of the same `region` prop (`site-header.tsx:22-27`), causing a duplicate announcement. Use the prop for the visible label or drop the `sr-only` duplicate.

**S-09 — Two fix commits do not carry their own tests.** `08aaf5f fix(ui): resolve token collision and restore AA contrast` and `39e775e fix(ui): expose hydration marker for deterministic e2e` are source-only; later e2e commits cover them, but this diverges from the “tests travel with behavior in the same commit” rule. No gate failure resulted.

---

## 2. Acceptance-criteria matrix (AC-01..18)

| AC | Status | Evidence |
|---|---|---|
| AC-01 | PASS | `npm run build`, `typecheck`, `lint` exit 0; e2e traverses `/` and `/reportar`; snapshots generated; axe 0 serious/critical; `DevMockBadge` asserted in `tests/e2e/home.spec.ts`. |
| AC-02 | PASS | Fresh `npm ci` and all four gates green on Node `v22.17.0`; CI job `test` mirrors the order (inspected). |
| AC-03 | PASS | `npm run e2e` 45/45 green; Playwright `webServer` ran `npm run build && npx next start -p 3100`; deep-link and form-submit specs included. |
| AC-04 | PARTIAL | `test-results/snapshots/` contains home/reportar at 390×844 and 1440×900 + confirmation; no 1280 px validation artifact; snapshots are generated artifacts (DEC-17), not committed. |
| AC-05 | PASS | `tests/e2e/a11y.spec.ts` ran axe on both routes: 0 serious/critical in all 3 projects. |
| AC-06 | PASS | `DevMockBadge` on CommunitySnapshot/Climate/Weather/River/IncidentCard/DetailSheet; integration tests; e2e badge assertion. Map count is not badged (not a card). |
| AC-07 | PASS | Unit: providers throw `MockProviderInProductionError`; route returns 404. Manual production server check: `404` + `{"code":"NOT_FOUND",...}`. |
| AC-08 | PASS | `app/` has only `page.tsx`, `reportar/page.tsx`, `api/overview/route.ts` (plus framework `layout`, `loading`, `not-found`, `icon.svg`). Build route table confirms. |
| AC-09 | PASS | `?reporte=` opens the sheet independently of filters (`deep-link.spec.ts`); `?categoria`/`?periodo` roundtrip and card share link e2e. `?zona` is parsed and applied in code/unit but has no direct e2e. |
| AC-10 | PASS | Category and period filters e2e; subtype row and period persistence tested. Caveat: agua+subtype → another category bug (W-02). |
| AC-11 | PARTIAL | Loading/Empty/Success/Error/Stale/Offline/PermissionDenied/PublishedUnverified/Verified paths exist; `partial` is not meaningfully rendered/tested; `Uploading` is absent; Moderation is represented via `PENDING_REVIEW` copy but not as a state discriminator. |
| AC-12 | PASS | `lib/domain/types.ts` matches §15.11 field names; report contracts match §11.2; `fixtures-contract.test.ts` compiles/satisfies and asserts fields/nulls. |
| AC-13 | PASS | All §5.8 lines, §21.2 consent, §6.5 confirmation, §8.6.1 legend are character-verbatim in `lib/domain/microcopy.ts` and consumer tests/e2e. |
| AC-14 | PASS | `.env.example` is tracked; `.env.local` ignored; all §24 vars are non-valid placeholders; only `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is public. |
| AC-15 | PASS | CI YAML has `test` + `e2e` + `secret-scan`, Node 22, `npm ci`, no production label, no project secrets; local equivalents green. Actions itself was not executed in this worktree. |
| AC-16 | PASS | 17 conventional commits, no trailers/AI attribution; fixtures use `mock://`, `rpt_mock_*`, `captured_at`, “no corresponde a un hecho real”; no secrets in diff. |
| AC-17 | PARTIAL | Typed implementation, strict zod shape, states (partial issues), a11y and provenance present; no PR/screenshot/revert artifact exists in this worktree; decision log has risks and deferrals. |
| AC-18 | PASS | README documents `netstat -ano | findstr :3100` and `taskkill //PID <pid> //F //T`; port 3100 was free before the e2e run. |

---

## 3. Gate results (fresh run in this worktree)

| Command | Exit | Key output |
|---|---|---|
| `npm ci` | 0 | 499 packages installed; `12 vulnerabilities (4 moderate, 7 high, 1 critical)` |
| `npm run lint` | 0 | no output (clean) |
| `npm run typecheck` | 0 | `tsc --noEmit` clean |
| `npm test` | 0 | `Test Files 16 passed (16)`, `Tests 90 passed (90)`, ~29.7 s |
| `npm run build` | 0 | compiled successfully; routes: `ƒ /`, `○ /_not-found`, `ƒ /api/overview`, `○ /icon.svg`, `○ /reportar` |
| `npm run e2e` | 0 | `45 passed (4.2m)` across `desktop-chromium`, `mobile-webkit`, `mobile-chromium` |
| `npm run test:coverage` | 0 | coverage emitted; `Statements 83.77%`, `Branches 68.82%`, `Functions 83.33%`, `Lines 85.52%` |
| Production gate (manual) | 404 | `PUBLIC_ENVIRONMENT_LABEL=production npx next start -p 3200`; `GET /api/overview` → `404` with uniform `{code,message,request_id,retryable}` body and security headers present |

Additional live checks on the production server (development label):
- `/` title: `Pulso Formosa — mapa de reportes ciudadanos y clima`; `<html lang="es-AR">`.
- `/reportar` title: `Reportar un problema — Pulso Formosa`; canonical incorrectly `/` (W-07).
- `/api/overview` 200 with `source_health.*.status = "fixture"` and `Cache-Control: s-maxage=60` (also covered by e2e).

## 4. REQ-group coverage summary

| Group | Status | Notes |
|---|---|---|
| BND | PASS with deviations | 01/02/03/06/07/08/09/11/12/13 satisfied. 04 partial (states), 05 partial (subtype bug). 10 **overridden** by owner (see §6). |
| IA | PASS except IA-10 | 01–09 and 11 verified; IA-10 canonical per page fails (W-07). |
| CMP | PASS with gaps | Closed `AsyncState`, server-first split, component contracts largely present; partial/uploading/stale-window gaps (W-03/W-04); EmptyState/UpdatedAt props differ (S-01). |
| DAT | PASS except DAT-06 | §15.11 enums/interfaces verbatim, nulls preserved, time/geo helpers correct. `overviewQuerySchema` strict object is defined but unused by the parser (S-01). |
| MCK | PASS | Fixtures typed/marked, providers implement both seams, production gate works, overview API shaped correctly, no fake persistence. `captured_at` is module-level in the report fixture rather than per record. |
| FRM | PARTIAL | 01/02/05/07/11/12 pass. 03 accuracy/outside-error, 04 uploading/error reasons, 06 Turnstile env slot, 08 map-pin preview, 09 idempotency payload, 10 invalid-photo/imprecise-GPS paths are incomplete. |
| STY | PARTIAL | 01/02/04/05/09/10 pass. 03 font sizes below spec; 06 icon sizes below 18 px; 07 44 px targets not met; 08 320/1280 checks absent. |
| CFG | PASS with owner deviation | All config files match the design; `db:*` scripts are the owner override (REQ-CFG-01’s “no db:*” is superseded). |
| TST | PASS with caveat | Unit/integration/e2e/coverage commands all run. `states.test.tsx` does not cover `partial`/`offline`; file count is 25 instead of 24 because of the owner-override DB test. |

### Spec’d but missing or only partially present

- `Uploading` visual state in `ImageUploader`; meaningful `Partial` state rendering and tests.
- “Esperando actualización” behavior after the freshness window; `staleness.ts` is not wired.
- “Marcar en mapa” affordance; GPS accuracy surfaced to the form; visible error for out-of-bbox GPS.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` read by the inert Turnstile slot.
- `idempotency_key` in a submit payload (generated but discarded).
- 1280 px viewport validation; a direct `?zona=` e2e; strong keyboard/focus-trap assertion.
- Metadata ≥13 px / body 15–17 px / 18–24 px icons / 44 px targets as specified.
- `next/image` thumbnails (no photos in C1, so not observable); `UpdatedAt` consumption.
- Per-page canonical for `/reportar`.

## 5. Non-negotiables sweep

- **Mocks visibly labelled**: `DevMockBadge` defaults to verbatim “Dato de prueba — mock de desarrollo” and is rendered by every listed fixture-fed card/detail; footer says “Datos de desarrollo — no usar para decisiones operativas”. PASS.
- **Hard production gate**: provider selector throws at access time; `/api/overview` returns JSON 404 under `PUBLIC_ENVIRONMENT_LABEL=production`; unit test + manual prod server test. PASS.
- **§5.8 / §13 / §21.2 / §6.5 / §8.6.1 microcopy**: all mandatory strings are present verbatim in `lib/domain/microcopy.ts` and consumed; e2e asserts the ENSO line and confirmation set. PASS.
- **es-AR / ART**: `<html lang="es-AR">`; `Intl` formatting uses `America/Argentina/Buenos_Aires`; Playwright `locale: es-AR`, `timezoneId: America/Argentina/Buenos_Aires`; times formatted `DD/MM/YYYY HH:mm ART`. PASS.
- **No invented data**: fixture URLs use `mock://`; report IDs use `rpt_mock_*`; descriptions state “Dato de prueba … no corresponde a un hecho real”; photos are empty with “Sin foto disponible”; no fake incidents served as fact. PASS.
- **No real providers / maps / Turnstile / persistence / deploy**: no provider fetches, no MapLibre/PMTiles/tile imports, no server Turnstile verification, no upload-intent, no rate limiter, no deployment config. PASS.
- **No empty dirs**: `find` found none; only the owner-override `lib/db/` is extra (non-empty). PASS.
- **No direct DB access from client**: `lib/db` is imported only by tests; no client component imports it. PASS.
- **Security headers**: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy: geolocation=(self)`, HSTS verified on the production server. PASS.
- **No secrets**: clean grep; `.env.local` ignored; no history entry. PASS.

## 6. Owner override (authorized deviation, recorded, not counted as failure)

The brief’s step 8 explicitly overrides REQ-BND-10 / XCL-01 / T-1.1:

- `lib/db/index.ts` provides a lazy `@neondatabase/serverless` + `drizzle-orm` seam; `lib/db/health.ts` probes `select 1` without throwing.
- `drizzle.config.ts`, `db:generate`, `db:migrate` exist.
- `.env.example` contains a `DATABASE_URL` placeholder.
- `tests/unit/db-seam.test.ts` adds a 10th unit test, so the final test/fixture count is 25 rather than the spec’s 24.
- `docs/decision-log.md` documents this as “implemented deviations (owner override)”.

This makes the literal REQ-BND-10 / XCL-01 statements false, but the override is intentional and documented; the verify brief itself requests it. The `db:generate` target `./lib/db/schema.ts` does not exist yet (schema is C2), so the command will fail until then; the config comment acknowledges this.

## 7. Commits, secrets and routes audits

### Commits

17 commits from `b0c9392` to `dee550c`, all conventional:

```
chore(tooling) / test(harness) / feat(db) / feat(domain) / test(harness)
feat(providers) / feat(ui) / feat(home) / feat(reportar) / fix(ui)
test(e2e) / docs / fix(ui) / test(e2e) / docs / fix(ui) / test(e2e)
```

- Author: `Adrian Gamarra <gamarraadrian200@gmail.com>` on every commit.
- No `Co-Authored-By`, no AI attribution, no trailers.
- One source-only CSS fix and one source-only hydration fix lack same-commit tests (S-09); later e2e covers them.
- `git rev-list --count b0c9392..HEAD` = 17.

### Secrets audit

```
git grep -n "npg_\|neondb_owner\|DATABASE_URL=" -- . ':!*.md' ':!.env.example' ':!tests'
→ no matches
git ls-files | grep -E '(^|/)\.env' → .env.example only
git log --all -- .env.local → empty
```

- `.env.local` is present locally, ignored by `.env.*` plus `!.env.example`, untracked, and never committed.
- `.env.example` values are placeholders; `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is the only genuinely public value; `APP_BASE_URL` is a local placeholder.
- No secrets in CI; `GITHUB_TOKEN` is the automatic Actions token used by gitleaks.
- `npm audit` is the only security concern (W-01), not a credential leak.

### Routes audit

```
app/page.tsx
app/reportar/page.tsx
app/api/overview/route.ts
app/layout.tsx
app/loading.tsx
app/not-found.tsx
app/icon.svg
```

Build output: `ƒ /`, `○ /_not-found`, `ƒ /api/overview`, `○ /icon.svg`, `○ /reportar`. No login, admin, chat, feed, voting, dashboard, extra public page, or extra API route. PASS (XCL-06, XCL-08).

## 8. Known-risk verification (R1/R2 and design risks)

- **R1 — Next 16 async APIs**: `app/page.tsx:41` types `searchParams` as `Promise<...>` and awaits it; `headers()` is awaited in `fetchOverview`. `next build` and dynamic `/` route succeed. No `next/dynamic { ssr:false }` call exists, so the server-component illegality risk is not exercised (design DEC-01 defers the real MapLibre boundary to C1B-b). PASS.
- **R2 — Tailwind v4**: `app/globals.css:1` uses `@import "tailwindcss"` and `@theme`; there is no `tailwind.config`. Build and e2e rendering succeed. The extra `--color-border: #2a4054` token is not from §8.3 (cosmetic design deviation). PASS with note.
- **R3 — base-nova primitives**: all 12 expected primitives exist under `components/ui/` with generated `data-slot`/`@base-ui/react` structure and a shared `cn()`; six are currently unconsumed. PASS with S-01.
- **R4 — build-time self-fetch**: page is `force-dynamic`; build passes without a live server dependency. The runtime origin construction is the SSRF concern in W-06. PASS with warning.
- **R5 — Windows e2e port**: README documents PID freeing; port 3100 was free and the Playwright webServer started successfully. PASS.
- **R6 — WebKit**: `mobile-webkit` passed all 15 tests. PASS.
- **R7 — mock leakage**: double gate + badges + e2e assertions + production manual check. PASS.
- **R8 — zod v4**: `strictObject`, `z.uuid()`, enums and safeParse tests pass. PASS.
- **R9 — font**: Inter via `next/font/google`, tabular numerals used; build pass. PASS.
- **R10 — fixture realism**: mock scheme, opaque IDs, captured-at markers, explicit non-real description, empty photos. PASS.

## 9. Limitations of this review

- GitHub Actions was not executed here; CI results are based on YAML inspection plus equivalent local commands.
- Browser snapshots are generated into ignored `test-results/snapshots/`; they exist locally but are not part of the commit and are overwritten by the last Playwright project, so their pixel dimensions are device-scaled (CSS viewports are still 390×844 and 1440×900).
- `.env.local` was read only for key presence and the non-production label; its `DATABASE_URL` value was never printed, logged or committed.
- The report was written after reading the full non-test diff and all source/config files changed by the 17 commits.
