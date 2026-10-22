import type { AsyncState } from "@/lib/domain/async-state";
import type { ClimateContext } from "@/lib/domain/types";
import { ENSO_DISCLAIMER, ENSO_PHASE_LABELS } from "@/lib/domain/enso";
import { LOADING_DATA, MEASUREMENT_ERROR_PREFIX } from "@/lib/domain/microcopy";
import { formatAbsoluteART } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { DataStaleNotice } from "./data-stale-notice";
import { DataErrorState } from "./data-error-state";
import { ProbabilityMetric } from "./probability-metric";

interface ClimateContextCardProps {
  state: AsyncState<ClimateContext>;
  fixture: boolean;
}

export function ClimateContextCard({ state, fixture }: ClimateContextCardProps) {
  const data = (
    state.status === "success" || state.status === "stale"
      ? state.data
      : state.status === "partial"
        ? state.data
        : null
  ) as ClimateContext | null;

  return (
    <section
      aria-labelledby="enso-title"
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id="enso-title" className="text-lg font-semibold">
          Contexto ENSO
        </h2>
        {fixture ? <DevMockBadge /> : null}
      </div>

      {state.status === "loading" ? (
        <p className="mt-3 text-sm text-text-secondary">{LOADING_DATA}</p>
      ) : null}

      {state.status === "empty" ? (
        <p className="mt-3 text-sm text-text-secondary">
          Sin información actual
        </p>
      ) : null}

      {state.status === "error" ? (
        <div className="mt-3">
          <DataErrorState
            message={`${MEASUREMENT_ERROR_PREFIX} ${state.lastData ? formatAbsoluteART(state.lastData.observed_at) : "sin registro"}`}
          />
        </div>
      ) : null}

      {state.status === "offline" ? (
        <div className="mt-3">
          <DataErrorState message="No pudimos actualizar esta medición. Revisá tu conexión." />
        </div>
      ) : null}

      {data ? (
        <div className="mt-3 space-y-3">
          <p className="text-2xl font-semibold tracking-tight">
            {ENSO_PHASE_LABELS[data.phase ?? "UNKNOWN"]}
          </p>

          <ProbabilityMetric
            valuePct={data.phase_probability_pct ?? null}
            title="Probabilidad oficial de fase"
            semanticLabel={
              data.probability_target_description ??
              "Probabilidad de fase ENSO en el trimestre"
            }
            periodLabel={data.season_label ?? "Trimestre no informado"}
            source={{ label: "Consulta fuente", href: data.source_url }}
          />

          <dl className="grid grid-cols-1 gap-1 text-xs text-text-secondary sm:grid-cols-2">
            <div>
              <dt className="inline">Emitido: </dt>
              <dd className="inline">{formatAbsoluteART(data.issued_at)}</dd>
            </div>
            <div>
              <dt className="inline">Observado: </dt>
              <dd className="inline">{formatAbsoluteART(data.observed_at)}</dd>
            </div>
          </dl>

          <a
            href={data.methodology_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm underline underline-offset-2 hover:text-accent-agua"
          >
            Metodología
          </a>

          <p className="rounded-lg bg-surface/70 p-2 text-xs text-text-secondary">
            {ENSO_DISCLAIMER}
          </p>

          {data.is_stale || state.status === "stale" ? <DataStaleNotice /> : null}
        </div>
      ) : null}
    </section>
  );
}
