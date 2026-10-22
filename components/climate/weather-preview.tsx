import type { AsyncState } from "@/lib/domain/async-state";
import type { WeatherPreview as WeatherPreviewData } from "@/lib/domain/types";
import {
  FORECAST_DISCLAIMER,
  FORECAST_LOCATION_LINE,
  LOADING_DATA,
  MEASUREMENT_ERROR_PREFIX,
  NO_RECENT_DATA,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { DataStaleNotice } from "./data-stale-notice";
import { DataErrorState } from "./data-error-state";

interface WeatherPreviewProps {
  state: AsyncState<WeatherPreviewData>;
  fixture: boolean;
}

export function WeatherPreview({ state, fixture }: WeatherPreviewProps) {
  const data = (
    state.status === "success" || state.status === "stale"
      ? state.data
      : state.status === "partial"
        ? state.data
        : null
  ) as WeatherPreviewData | null;

  return (
    <section
      aria-labelledby="lluvias-title"
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="lluvias-title" className="text-lg font-semibold">
          Próximas lluvias
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
            message={`${MEASUREMENT_ERROR_PREFIX} ${state.lastData ? formatAbsoluteART(state.lastData.fetched_at) : "sin registro"}`}
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
          <p className="text-sm text-text-secondary">{FORECAST_LOCATION_LINE}</p>

          <div className="rounded-lg border border-border/60 bg-surface/60 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">{data.location}</p>
              <p className="tabular text-2xl font-semibold text-accent-lluvia">
                {data.precip_expected_mm === null
                  ? NO_RECENT_DATA
                  : `${data.precip_expected_mm} mm`}
              </p>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-text-secondary">
              <div>
                <dt className="inline">Probabilidad: </dt>
                <dd className="tabular inline">
                  {data.precip_probability_pct === null
                    ? NO_RECENT_DATA
                    : `${data.precip_probability_pct}%`}
                </dd>
              </div>
              <div>
                <dt className="inline">Modelo: </dt>
                <dd className="inline">{data.model}</dd>
              </div>
              <div className="col-span-2">
                <dt className="inline">Ventana: </dt>
                <dd className="inline">
                  {data.forecast_window_start && data.forecast_window_end
                    ? `${formatAbsoluteART(data.forecast_window_start)} → ${formatAbsoluteART(data.forecast_window_end)}`
                    : NO_RECENT_DATA}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="inline">Corrida: </dt>
                <dd className="inline">{formatAbsoluteART(data.run_at)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-text-secondary">
              {data.uncertainty_text}
            </p>
          </div>

          <p className="rounded-lg bg-surface/70 p-2 text-xs text-text-secondary">
            {FORECAST_DISCLAIMER}
          </p>

          {data.is_stale || state.status === "stale" ? <DataStaleNotice /> : null}
        </div>
      ) : null}
    </section>
  );
}
