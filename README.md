# Pulso Formosa

Public civic-reporting site for the province of Formosa, Argentina. Two public
routes: `/` (observe climate, river and citizen reports) and `/reportar`
(anonymous incident report).

> **Mock data — development only.** All climate, river and report data served by
> this iteration is visibly labelled fixture data (`Dato de prueba — mock de
> desarrollo`). Fixture providers refuse to run when
> `PUBLIC_ENVIRONMENT_LABEL=production`.

## Prerequisites

- Node.js 22 (`.nvmrc`) — minimum supported is 20.9
- npm 10+

## Install

```bash
npm ci
```

Copy `.env.example` to `.env.local` and fill only what you need. The app runs
without any secret: `PUBLIC_ENVIRONMENT_LABEL=development` is enough.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint flat config |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + integration) |
| `npm run test:coverage` | Vitest with v8 coverage (no thresholds) |
| `npm run e2e` | Playwright against a production build |
| `npm run e2e:install` | First-time browser install (`chromium`, `webkit`) |
| `npm run db:generate` | Drizzle migration generation (schema lands in C2) |
| `npm run db:migrate` | Apply Drizzle migrations |

## End-to-end tests

E2E runs **only against a production build** (`npm run build` + `next start`),
never against `next dev`. The Playwright config starts that server on port 3100
by itself. First time:

```bash
npm run e2e:install
npm run e2e
```

### Windows: free the port by PID

If a previous server is stuck on the port:

```bash
netstat -ano | findstr :3100
taskkill //PID <pid> //F //T
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 ·
shadcn-style primitives · MapLibre placeholder (cartography in C1B-b) ·
Neon + Drizzle seam (schema in C2) · Vitest · Playwright · axe-core.

## Data policy

Citizen reports, forecasts, official observations and editorial verification are
never merged into one confidence level. Every climate figure carries variable,
unit, timeframe and source. Null values stay null and render as “Sin dato” —
never `0`.
