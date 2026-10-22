import { NO_DATA } from "@/lib/domain/microcopy";

interface ProbabilityMetricProps {
  valuePct: number | null;
  title: string;
  semanticLabel: string;
  periodLabel: string;
  source: { label: string; href: string };
}

export function ProbabilityMetric({
  valuePct,
  title,
  semanticLabel,
  periodLabel,
  source,
}: ProbabilityMetricProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/60 p-3">
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="tabular mt-1 text-3xl font-semibold text-accent-lluvia">
        {valuePct === null ? NO_DATA : `${valuePct}%`}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{semanticLabel}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {periodLabel} ·{" "}
        <a
          href={source.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-text"
        >
          {source.label}
        </a>
      </p>
    </div>
  );
}
