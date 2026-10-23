import Link from "next/link";
import type { PublicReportCard } from "@/lib/domain/report";
import { CATEGORY_LABELS, EDITORIAL_LABELS } from "@/lib/domain/taxonomy";
import { NO_PHOTO } from "@/lib/domain/microcopy";
import { formatAbsoluteART, formatRelativeAge } from "@/lib/domain/time";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { ShareCopyButton } from "./share-copy-button";
import { UpdatedAt } from "./updated-at";

interface IncidentCardProps {
  report: PublicReportCard;
  fixture: boolean;
  sharePath: string;
}

export function IncidentCard({ report, fixture, sharePath }: IncidentCardProps) {
  const verified = report.editorial_status === "VERIFIED_EDITORIALLY";

  return (
    <article className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
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
        {fixture ? <DevMockBadge /> : null}
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug">
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

      <div className="mt-3 rounded-lg border border-dashed border-border bg-surface/50 p-3 text-[13px] text-text-secondary">
        {NO_PHOTO}
      </div>

      <div className="mt-2">
        <UpdatedAt timestamp={report.updated_at} />
      </div>

      <div className="mt-3">
        <ShareCopyButton
          path={sharePath}
          text={`${report.summary} · ${CATEGORY_LABELS[report.category]} · Formosa`}
          label="Compartir"
        />
      </div>
    </article>
  );
}
