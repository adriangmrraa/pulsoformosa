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
      className="field-hero reveal-up p-5 sm:p-7"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="resumen-title" className="text-xs font-semibold tracking-[0.16em] text-accent-agua uppercase">
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
        <div className="mt-5">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <strong className="tabular text-6xl font-semibold leading-none text-text sm:text-7xl">
              {data.published_reports_count}
            </strong>
            <p className="max-w-[12rem] pb-1 text-sm leading-snug text-text-secondary">
              reportes públicos en {data.period === "24h" ? "24 h" : data.period === "7d" ? "7 días" : "30 días"}
            </p>
          </div>
          <div className="mt-6 grid gap-4 border-t border-border/70 pt-4 sm:grid-cols-3">
            <div>
              <p className="tabular text-2xl font-semibold text-accent-agua">{data.distinct_zones_count}</p>
              <p className="mt-1 text-xs text-text-secondary">zonas con actividad</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text">{predominantCategoryLabel}</p>
              <p className="mt-1 text-xs text-text-secondary">categoría predominante</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text">{data.scope_bbox_or_zone}</p>
              <p className="mt-1 text-xs text-text-secondary">cobertura de esta vista</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/50 pt-3 text-xs text-text-secondary">
            <p>Actualizado: {data.last_public_report_at ? formatAbsoluteART(data.last_public_report_at) : "sin registros"}</p>
            <p>Fuente climática: {climateSourceLabel}</p>
            <p>Generado: {generatedAt ? formatAbsoluteART(generatedAt) : "sin dato"}</p>
          </div>
          <p className="mt-4 max-w-2xl border-l-2 border-accent-lluvia/70 pl-3 text-xs leading-relaxed text-text-secondary">
            {data.caveat}
          </p>
          {state.status === "stale" ? <DataStaleNotice /> : null}
        </div>
      ) : null}
    </section>
  );
}
