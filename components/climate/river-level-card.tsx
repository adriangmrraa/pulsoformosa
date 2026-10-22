import type { AsyncState } from "@/lib/domain/async-state";
import type { RiverLevel } from "@/lib/domain/types";
import {
  LOADING_DATA,
  MEASUREMENT_ERROR_PREFIX,
  NO_RECENT_DATA,
  RIVER_DATUM_DISCLAIMER,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { SourceLink } from "@/components/reports/source-link";
import { DataStaleNotice } from "./data-stale-notice";
import { DataErrorState } from "./data-error-state";

const TREND_LABELS: Record<RiverLevel["trend"], string> = {
  rising: "Subiendo",
  stable: "Estable",
  falling: "Bajando",
  unknown: "Sin tendencia informada",
};

interface RiverLevelCardProps {
  state: AsyncState<RiverLevel>;
  fixture: boolean;
}

export function RiverLevelCard({ state, fixture }: RiverLevelCardProps) {
  const data = (
    state.status === "success" || state.status === "stale"
      ? state.data
      : state.status === "partial"
        ? state.data
        : null
  ) as RiverLevel | null;

  return (
    <section
      aria-labelledby="rio-title"
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="rio-title" className="text-lg font-semibold">
          Río Paraguay — Puerto Formosa
        </h2>
        {fixture ? <DevMockBadge /> : null}
      </div>

      {state.status === "loading" ? (
        <p className="mt-3 text-sm text-text-secondary">{LOADING_DATA}</p>
      ) : null}

      {state.status === "empty" ? (
        <p className="mt-3 text-sm text-text-secondary">{NO_RECENT_DATA}</p>
      ) : null}

      {state.status === "error" ? (
        <div className="mt-3">
          <DataErrorState
            message={`${MEASUREMENT_ERROR_PREFIX} ${state.lastData ? formatAbsoluteART(state.lastData.measured_at) : "sin registro"}`}
          />
        </div>
      ) : null}

      {state.status === "offline" ? (
        <div className="mt-3">
          <DataErrorState message="No pudimos actualizar esta medición. Revisá tu conexión." />
        </div>
      ) : null}

      {data ? (
        <div className="mt-3 space-y-2">
          <p className="tabular text-3xl font-semibold text-accent-agua">
            {data.level_m === null ? NO_RECENT_DATA : `${data.level_m} m`}
          </p>

          <dl className="grid grid-cols-2 gap-1 text-xs text-text-secondary">
            <div>
              <dt className="inline">Tendencia: </dt>
              <dd className="inline">{TREND_LABELS[data.trend]}</dd>
            </div>
            <div>
              <dt className="inline">Medición: </dt>
              <dd className="inline">{formatAbsoluteART(data.measured_at)}</dd>
            </div>
          </dl>

          <p className="text-xs text-text-secondary">{data.datum_explanation}</p>
          <p className="rounded-lg bg-surface/70 p-2 text-xs text-text-secondary">
            {RIVER_DATUM_DISCLAIMER}
          </p>

          <SourceLink href={data.source_url} label="Consultar organismo" />

          {data.is_stale || state.status === "stale" ? <DataStaleNotice /> : null}
        </div>
      ) : null}
    </section>
  );
}
