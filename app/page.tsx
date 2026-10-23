import type { Metadata } from "next";
import type { AsyncState } from "@/lib/domain/async-state";
import type {
  ClimateContext,
  CommunityStats,
  OverviewPayload,
  ReportListPage,
  RiverLevel,
  WeatherPreview as WeatherPreviewData,
} from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";
import { CATEGORY_LABELS, type ReportCategory } from "@/lib/domain/taxonomy";
import { MEASUREMENT_ERROR_PREFIX } from "@/lib/domain/microcopy";
import { getReportsProvider } from "@/lib/providers";
import {
  parseOverviewQuery,
  toReportQuery,
  type OverviewQuery,
} from "@/lib/validation/query-params";
import { SOURCES_FIXTURE } from "@/tests/fixtures/sources.fixture";
import { ClimateContextCard } from "@/components/climate/climate-context-card";
import { WeatherPreview } from "@/components/climate/weather-preview";
import { RiverLevelCard } from "@/components/climate/river-level-card";
import { CommunitySnapshot } from "@/components/home/community-snapshot";
import { FilterChips } from "@/components/home/filter-chips";
import { TimeRangeSelector } from "@/components/home/time-range-selector";
import { IncidentMap } from "@/components/map/incident-map";
import { IncidentCard } from "@/components/reports/incident-card";
import { IncidentDetailSheet } from "@/components/reports/incident-detail-sheet";
import { Pagination } from "@/components/home/pagination";
import { EmptyState } from "@/components/home/empty-state";
import { ReportCTA } from "@/components/home/report-cta";
import { getAppBaseUrl } from "@/lib/site";
import { HydrationMarker } from "@/components/ui/hydration-marker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const CENTER: [number, number] = [-58.18, -26.18];
const EMPTY_PAGE: ReportListPage = { items: [], nextCursor: null, pageSize: 0 };
const ERROR_MESSAGE = `${MEASUREMENT_ERROR_PREFIX} sin registro`;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(
  query: OverviewQuery,
  overrides: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  if (query.categoria !== "todos") params.set("categoria", query.categoria);
  if (query.periodo !== "7d") params.set("periodo", query.periodo);
  if (query.zona) params.set("zona", query.zona);
  if (query.subtipo) params.set("subtipo", query.subtipo);
  if (query.cursor) params.set("cursor", query.cursor);

  for (const [key, value] of Object.entries(overrides)) {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

function successState<T>(value: T, staleSince?: string): AsyncState<T> {
  if (staleSince) return { status: "stale", data: value, since: staleSince };
  return { status: "success", data: value };
}

function errorOrEmpty<T>(overview: OverviewPayload | null): AsyncState<T> {
  return overview
    ? { status: "empty" }
    : { status: "error", message: ERROR_MESSAGE };
}

async function fetchOverview(
  query: OverviewQuery,
): Promise<OverviewPayload | null> {
  try {
    const url = new URL("/api/overview", getAppBaseUrl());
    url.searchParams.set("periodo", query.periodo);
    if (query.categoria !== "todos") {
      url.searchParams.set("categoria", query.categoria);
    }
    if (query.zona) url.searchParams.set("zona", query.zona);
    if (query.subtipo) url.searchParams.set("subtipo", query.subtipo);

    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as OverviewPayload;
  } catch {
    return null;
  }
}

function predominantCategory(items: ReportListPage["items"]): string {
  if (items.length === 0) return "Sin datos suficientes";
  const counts = new Map<ReportCategory, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? CATEGORY_LABELS[top[0]] : "Sin datos suficientes";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const query = parseOverviewQuery({
    reporte: firstValue(raw.reporte),
    zona: firstValue(raw.zona),
    categoria: firstValue(raw.categoria),
    subtipo: firstValue(raw.subtipo),
    periodo: firstValue(raw.periodo),
    cursor: firstValue(raw.cursor),
  });

  const overview = await fetchOverview(query);

  let reportPage: ReportListPage = EMPTY_PAGE;
  try {
    reportPage = await getReportsProvider().listReports(toReportQuery(query));
  } catch {
    reportPage = EMPTY_PAGE;
  }

  let detail: PublicReport | null = null;
  if (query.reporte) {
    try {
      detail = await getReportsProvider().getReportById(query.reporte);
    } catch {
      detail = null;
    }
  }

  const climateState: AsyncState<ClimateContext> = overview?.climate
    ? successState(
        overview.climate,
        overview.climate.is_stale ? overview.climate.observed_at : undefined,
      )
    : errorOrEmpty<ClimateContext>(overview);

  const weatherState: AsyncState<WeatherPreviewData> = overview?.weather
    ? successState(
        overview.weather,
        overview.weather.is_stale ? overview.weather.fetched_at : undefined,
      )
    : errorOrEmpty<WeatherPreviewData>(overview);

  const riverState: AsyncState<RiverLevel> = overview?.river
    ? successState(
        overview.river,
        overview.river.is_stale ? overview.river.measured_at : undefined,
      )
    : errorOrEmpty<RiverLevel>(overview);

  const communityState: AsyncState<CommunityStats> = overview?.community
    ? successState(overview.community)
    : errorOrEmpty<CommunityStats>(overview);

  const nextHref = reportPage.nextCursor
    ? buildHref(query, { cursor: reportPage.nextCursor })
    : null;

  return (
    <>
      <HydrationMarker />
      <div className="container-page py-6 pb-28 md:py-10">
        <div className="max-w-4xl reveal-up">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-accent-agua uppercase">
            Pulso ciudadano · Formosa Capital
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Esto se está reportando en Formosa
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            Reportes de vecinos con contexto climático oficial. Los conteos son
            reportes públicos, no personas afectadas.
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <CommunitySnapshot
            state={communityState}
            fixture
            predominantCategoryLabel={predominantCategory(reportPage.items)}
            generatedAt={overview?.published_at}
            />
          </div>
          <div className="xl:col-span-5">
            <ClimateContextCard state={climateState} fixture />
          </div>
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-[1.5rem] border border-border/60 bg-border/60 md:grid-cols-2">
          <WeatherPreview state={weatherState} fixture />
          <RiverLevelCard state={riverState} fixture />
        </div>

        <div className="mt-6">
          <IncidentMap reports={reportPage.items} center={CENTER} />
        </div>

        <section id="lista-reportes" aria-labelledby="lista-reportes-title" className="mt-8">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="lista-reportes-title" className="text-2xl font-semibold tracking-tight">
              Reportes recientes
            </h2>
            <TimeRangeSelector value={query.periodo} />
          </div>

          <div className="mt-3">
            <FilterChips active={query.categoria} activeSubtype={query.subtipo} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {reportPage.items.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState />
              </div>
            ) : (
              reportPage.items.map((report) => (
                <IncidentCard
                  key={report.id}
                  report={report}
                  fixture
                  sharePath={buildHref(query, { reporte: report.id })}
                />
              ))
            )}
          </div>

          <Pagination nextHref={nextHref} />
        </section>

        <section aria-labelledby="fuentes-title" className="mt-10">
          <h2 id="fuentes-title" className="text-xl font-semibold">
            Fuentes y metodología
          </h2>
          <p className="mt-2 max-w-prose text-sm text-text-secondary">
            En esta iteración todas las fuentes son simuladas. Cada tarjeta
            indica su origen y, cuando exista, el enlace para consultar al
            organismo.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-text-secondary">
            {SOURCES_FIXTURE.map((source) => (
              <li key={source.key}>
                {source.label} ·{" "}
                <a
                  href={source.url}
                  className="underline underline-offset-2 hover:text-text"
                >
                  consultar fuente
                </a>{" "}
                ·{" "}
                <a
                  href={source.methodology_url}
                  className="underline underline-offset-2 hover:text-text"
                >
                  metodología
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ReportCTA variant="sticky-mobile" />

      <IncidentDetailSheet report={detail} open={Boolean(detail)} />
    </>
  );
}
