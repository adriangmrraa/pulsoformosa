import type { Metadata } from "next";
import type { ReportListPage } from "@/lib/domain/types";
import type { PublicReport } from "@/lib/domain/report";
import { deriveReportStatus, type Solution } from "@/lib/domain/solution";
import { getStore } from "@/lib/server/store";
import {
  parseOverviewQuery,
  toReportQuery,
  type OverviewQuery,
} from "@/lib/validation/query-params";
import { PERIOD_LABELS } from "@/lib/domain/microcopy";
import { ReportExplorer } from "@/components/home/report-explorer";
import { FilterChips } from "@/components/home/filter-chips";
import { TimeRangeSelector } from "@/components/home/time-range-selector";
import { IncidentCard } from "@/components/reports/incident-card";
import { Pagination } from "@/components/home/pagination";
import { EmptyState } from "@/components/home/empty-state";
import { ReportCTA } from "@/components/home/report-cta";
import { HydrationMarker } from "@/components/ui/hydration-marker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const EMPTY_PAGE: ReportListPage = {
  items: [],
  nextCursor: null,
  pageSize: 0,
  total: 0,
};

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
  let selectionDataset: PublicReport[] = [];
  let solutions: Solution[] = [];
  let resolvedReportId: string | undefined;
  let fixture = false;

  try {
    const store = await getStore();
    fixture = store.backend === "json";
    const reportQuery = toReportQuery(query);

    // Paginated page feeds the list below the fold; the map/selection dataset
    // asks for up to 50 rows without a cursor so pins cover the whole query.
    const [page, mapDataset] = await Promise.all([
      store.listReports(reportQuery),
      store.listReports({ ...reportQuery, cursor: undefined, limit: 50 }),
    ]);
    reportPage = page;

    // Deep link: resolves independently of the active filters. When the
    // report is outside the filtered page it joins the selection dataset so
    // pins, panel and URL keep pointing at one real report.
    let deepLinked: PublicReport | null = null;
    if (query.reporte) {
      const resolved = await store.getReportById(query.reporte);
      if (resolved) {
        resolvedReportId = resolved.id;
        if (!mapDataset.items.some((item) => item.id === resolved.id)) {
          deepLinked = resolved;
        }
      }
    }

    selectionDataset = [...mapDataset.items, ...(deepLinked ? [deepLinked] : [])]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    solutions = await store.listSolutions(
      selectionDataset.map((report) => report.id),
    );
  } catch {
    reportPage = EMPTY_PAGE;
    selectionDataset = [];
    solutions = [];
  }

  const nextHref = reportPage.nextCursor
    ? buildHref(query, { cursor: reportPage.nextCursor })
    : null;

  return (
    <>
      <HydrationMarker />
      <div className="container-page pt-5 md:pt-7">
        <div className="max-w-4xl">
          <h1 className="max-w-3xl text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
            Esto se está reportando en Formosa
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
            Reportes de vecinos sobre el mapa de la ciudad. Tocá un punto para
            ver el detalle y las soluciones aportadas.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ReportExplorer
          reports={selectionDataset}
          solutions={solutions}
          initialReportId={resolvedReportId}
          fixture={fixture}
        />
      </div>

      <div className="container-page pb-28">
        <section
          id="lista-reportes"
          aria-labelledby="lista-reportes-title"
          className="mt-8"
        >
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="lista-reportes-title"
                className="text-2xl font-semibold tracking-tight"
              >
                Reportes recientes
              </h2>
              <p className="mt-1 text-xs text-text-secondary">
                {reportPage.total} reportes públicos en{" "}
                {PERIOD_LABELS[query.periodo]}
              </p>
            </div>
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
                  (item) =>
                    item.report_id === report.id && item.status !== "rejected",
                );
                return (
                  <IncidentCard
                    key={report.id}
                    report={report}
                    fixture={fixture}
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
            {fixture
              ? "Los reportes marcados como dato de prueba son contenido de demostración persistido en el almacenamiento local de desarrollo."
              : "Los reportes son aportes de vecinos publicados sin verificación editorial."}{" "}
            La ubicación exacta nunca se publica: cada punto se muestra con una
            aproximación de ~250&nbsp;m. Las soluciones vecinales pasan por
            moderación antes de contar como resolución del reporte.
          </p>
        </section>
      </div>

      <ReportCTA variant="sticky-mobile" />
    </>
  );
}
