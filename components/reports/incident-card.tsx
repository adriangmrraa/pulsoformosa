import Link from "next/link";
import type { PublicReportCard } from "@/lib/domain/report";
import type { DerivedReportStatus } from "@/lib/domain/solution";
import { CATEGORY_LABELS, EDITORIAL_LABELS } from "@/lib/domain/taxonomy";
import {
  NO_PHOTO,
  STATUS_OPEN,
  STATUS_SOLVED,
} from "@/lib/domain/microcopy";
import { formatAbsoluteART, formatRelativeAge } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { ShareCopyButton } from "./share-copy-button";
import { UpdatedAt } from "./updated-at";

interface IncidentCardProps {
  report: PublicReportCard;
  fixture: boolean;
  sharePath: string;
  status: DerivedReportStatus;
  solutionCount: number;
}

export function IncidentCard({
  report,
  fixture,
  sharePath,
  status,
  solutionCount,
}: IncidentCardProps) {
  const verified = report.editorial_status === "VERIFIED_EDITORIALLY";
  const solved = status === "solved";

  return (
    <article className="reveal-up border-y border-border/60 border-l-2 border-l-accent-agua bg-card/35 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
          {CATEGORY_LABELS[report.category]}
        </span>
        <span
          className={
            verified
              ? "rounded-full bg-exito/15 px-2.5 py-1 text-xs font-medium text-exito"
              : "rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary"
          }
        >
          {EDITORIAL_LABELS[report.editorial_status]}
        </span>
        <span
          className={
            solved
              ? "rounded-full bg-accent-green/15 px-2.5 py-1 text-xs font-medium text-accent-green"
              : "rounded-full bg-alerta-alta/15 px-2.5 py-1 text-xs font-medium text-alerta-alta"
          }
        >
          {solved ? STATUS_SOLVED : STATUS_OPEN}
        </span>
        {solutionCount > 0 ? (
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
            {solutionCount === 1
              ? "1 solución"
              : `${solutionCount} soluciones`}
          </span>
        ) : null}
        {fixture ? <DevMockBadge /> : null}
      </div>

      <h3 className="mt-4 max-w-2xl text-lg font-semibold leading-snug sm:text-xl">
        <Link
          href={sharePath}
          className="transition-ui hover:text-accent-agua"
        >
          {report.summary}
        </Link>
      </h3>

      <p className="mt-1 text-sm text-text-secondary">
        {report.approx_zone ?? "Barrio sin identificar"}
        {report.subtype ? ` · ${report.subtype}` : ""}
      </p>

      <p className="mt-2 text-xs text-text-secondary">
        <time dateTime={report.published_at} title={formatAbsoluteART(report.published_at)}>
          {formatRelativeAge(report.published_at)}
        </time>
        <span aria-hidden="true"> · </span>
        <span className="hidden tabular sm:inline">
          {formatAbsoluteART(report.published_at)}
        </span>
        <span className="sr-only">({formatAbsoluteART(report.published_at)})</span>
      </p>

      <div className="mt-4 border-t border-border/60 pt-3 text-[13px] text-text-secondary">
        {NO_PHOTO}
      </div>

      <div className="mt-2">
        <UpdatedAt timestamp={report.updated_at} />
      </div>

      <div className="mt-4">
        <ShareCopyButton
          path={sharePath}
          text={`${report.summary} · ${CATEGORY_LABELS[report.category]} · Formosa`}
          label="Compartir"
        />
      </div>
    </article>
  );
}
