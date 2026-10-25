import type { Metadata } from "next";
import type { ReportListPage } from "@/lib/domain/types";
import { deriveReportStatus, type Solution } from "@/lib/domain/solution";
import { getReportsProvider } from "@/lib/providers";
import {
  parseOverviewQuery,
  toReportQuery,
  type OverviewQuery,
} from "@/lib/validation/query-params";
import { SOURCES_FIXTURE } from "@/tests/fixtures/sources.fixture";
import { FilterChips } from "@/components/home/filter-chips";
import { TimeRangeSelector } from "@/components/home/time-range-selector";
import { IncidentMap } from "@/components/map/incident-map";
import { IncidentCard } from "@/components/reports/incident-card";
import { Pagination } from "@/components/home/pagination";
import { EmptyState } from "@/components/home/empty-state";
import { ReportCTA } from "@/components/home/report-cta";
import { HydrationMarker } from "@/components/ui/hydration-marker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const CENTER: [number, number] = [-58.18, -26.18];
const EMPTY_PAGE: ReportListPage = { items: [], nextCursor: null, pageSize: 0 };

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

  let reportPage: ReportListPage = EMPTY_PAGE;
  let solutions: Solution[] = [];
  try {
    const provider = getReportsProvider();
    reportPage = await provider.listReports(toReportQuery(query));
    solutions = await provider.listSolutions(
      reportPage.items.map((report) => report.id),
    );
  } catch {
    reportPage = EMPTY_PAGE;
    solutions = [];
  }

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
            Reportes de vecinos sobre un mapa de la ciudad. Los conteos son
            reportes públicos, no personas afectadas.
          </p>
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
              reportPage.items.map((report) => {
                const reportSolutions = solutions.filter(
                  (item) => item.report_id === report.id,
                );
                return (
                  <IncidentCard
                    key={report.id}
                    report={report}
                    fixture
                    sharePath={buildHref(query, { reporte: report.id })}
                    status={deriveReportStatus(report, reportSolutions)}
                    solutionCount={reportSolutions.length}
                  />
                );
              })
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
    </>
  );
}
