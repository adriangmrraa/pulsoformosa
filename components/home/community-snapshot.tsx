import type { AsyncState } from "@/lib/domain/async-state";
import type { CommunityStats } from "@/lib/domain/types";
import {
  LOADING_DATA,
  MEASUREMENT_ERROR_PREFIX,
  QUICK_SUMMARY_TITLE,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { DataErrorState } from "@/components/climate/data-error-state";
import { DataStaleNotice } from "@/components/climate/data-stale-notice";
import { PartialNotice } from "@/components/ui/partial-notice";

interface CommunitySnapshotProps {
  state: AsyncState<CommunityStats>;
  fixture: boolean;
  predominantCategoryLabel?: string;
  generatedAt?: string;
  climateSourceLabel?: string;
}

export function CommunitySnapshot({
  state,
  fixture,
  predominantCategoryLabel = "Sin datos suficientes",
  generatedAt,
  climateSourceLabel = "NOAA CPC (mock)",
}: CommunitySnapshotProps) {
  const data =
    state.status === "success" || state.status === "stale"
      ? state.data
      : state.status === "partial"
        ? state.data
        : null;

  return (
    <section
      aria-labelledby="resumen-title"
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="resumen-title" className="text-lg font-semibold">
          {QUICK_SUMMARY_TITLE}
        </h2>
        {fixture ? <DevMockBadge /> : null}
      </div>

      {state.status === "partial" ? (
        <PartialNotice missing={state.missing} />
      ) : null}

      {state.status === "loading" ? (
        <p className="mt-3 text-sm text-text-secondary">{LOADING_DATA}</p>
      ) : null}

      {state.status === "empty" ? (
        <p className="mt-3 text-sm text-text-secondary">
          Sin reportes públicos en el período.
        </p>
      ) : null}

      {state.status === "error" ? (
        <div className="mt-3">
          <DataErrorState
            message={`${MEASUREMENT_ERROR_PREFIX} ${state.lastData?.last_public_report_at ? formatAbsoluteART(state.lastData.last_public_report_at) : "sin registro"}`}
          />
        </div>
      ) : null}

      {state.status === "offline" ? (
        <div className="mt-3">
          <DataErrorState message="No pudimos actualizar esta medición. Revisá tu conexión." />
        </div>
      ) : null}

      {data ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <strong className="tabular text-lg">
              {data.published_reports_count}
            </strong>{" "}
            reportes públicos en{" "}
            {data.period === "24h"
              ? "24 h"
              : data.period === "7d"
                ? "7 días"
                : "30 días"}
            .
          </p>
          <p>
            <strong className="tabular text-lg">
              {data.distinct_zones_count}
            </strong>{" "}
            zonas con reportes. Una zona agrupa reportes por barrio o sector
            aproximado, no por persona afectada.
          </p>
          <p>
            Última publicación:{" "}
            {data.last_public_report_at
              ? formatAbsoluteART(data.last_public_report_at)
              : "sin registros"}
            .
          </p>
          <p>Categoría predominante: {predominantCategoryLabel}.</p>
          <p>Fuente climática: {climateSourceLabel}.</p>
          <p>
            Generado: {generatedAt ? formatAbsoluteART(generatedAt) : "sin dato"}
            . Cobertura: {data.scope_bbox_or_zone}.
          </p>
          <p className="rounded-lg bg-surface/70 p-2 text-xs text-text-secondary">
            {data.caveat}
          </p>
          {state.status === "stale" ? <DataStaleNotice /> : null}
        </div>
      ) : null}
    </section>
  );
}
