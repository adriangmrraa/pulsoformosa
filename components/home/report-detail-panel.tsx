"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicReport } from "@/lib/domain/report";
import type { DerivedReportStatus, Solution } from "@/lib/domain/solution";
import {
  CATEGORY_LABELS,
  EDITORIAL_LABELS,
} from "@/lib/domain/taxonomy";
import {
  EXPECTED_SOLUTION_TITLE,
  NO_PHOTO,
  SOLUTION_APPROVED_LABEL,
  SOLUTION_PENDING_LABEL,
  SOLUTIONS_DATA_WARNING,
  SOLUTIONS_TITLE,
  STATUS_OPEN,
  STATUS_SOLVED,
} from "@/lib/domain/microcopy";
import {
  formatAbsoluteART,
  formatRelativeAge,
} from "@/lib/domain/time";
import type { SolutionFormInput } from "@/lib/validation/solution-form";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { ShareCopyButton } from "@/components/reports/share-copy-button";
import { UpdatedAt } from "@/components/reports/updated-at";
import { SolutionForm } from "./solution-form";

interface ReportDetailPanelProps {
  report: PublicReport;
  /** 0-based position inside the created_at-desc dataset. */
  index: number;
  total: number;
  status: DerivedReportStatus;
  /** Public-view solutions (rejected already filtered by the hook). */
  solutions: Solution[];
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  fixture: boolean;
  /** Share URL preserving the report and the active filters. */
  sharePath: string;
  onSubmitSolution: (input: SolutionFormInput) => Promise<Solution>;
}

/**
 * Selected-report card under the compact map frame (REQ-PNL). Visual order
 * follows the demobondis LineArrivalsCard: position eyebrow + title + nav
 * actions, status chips, one-line metadata, then the solutions well; the
 * essentials stay above the fold at phone and desktop viewports.
 */
export function ReportDetailPanel({
  report,
  index,
  total,
  status,
  solutions,
  canPrev,
  canNext,
  onPrev,
  onNext,
  fixture,
  sharePath,
  onSubmitSolution,
}: ReportDetailPanelProps) {
  const solved = status === "solved";

  return (
    <section aria-label="Detalle del reporte" className="container-page">
      <div className="rounded-3xl border border-border/60 bg-card/40 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p
              aria-live="polite"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary"
            >
              Reporte {index + 1} de {total}
            </p>
            <h2 className="mt-0.5 text-[17px] font-bold leading-tight sm:text-lg">
              {report.summary}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="Reporte anterior"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-sm transition-ui hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext}
              aria-label="Reporte siguiente"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-sm transition-ui hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {CATEGORY_LABELS[report.category]}
          </span>
          {report.subtype ? (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
              {report.subtype}
            </span>
          ) : null}
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {EDITORIAL_LABELS[report.editorial_status]}
          </span>
          <span
            className={
              solved
                ? "rounded-full bg-accent-green/15 px-2 py-0.5 text-[11px] font-medium text-accent-green"
                : "rounded-full bg-alerta-alta/15 px-2 py-0.5 text-[11px] font-medium text-alerta-alta"
            }
          >
            {solved ? STATUS_SOLVED : STATUS_OPEN}
          </span>
          {fixture ? <DevMockBadge /> : null}
        </div>

        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] leading-snug text-text-secondary">
          <div>
            <dt className="inline font-medium">Zona aproximada: </dt>
            <dd className="inline">
              {report.approx_zone ?? "Barrio sin identificar"}
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Publicado: </dt>
            <dd className="inline">
              <time
                dateTime={report.published_at}
                title={formatAbsoluteART(report.published_at)}
              >
                {formatRelativeAge(report.published_at)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">ID público: </dt>
            <dd className="tabular inline">{report.id}</dd>
          </div>
        </dl>

        <p className="mt-1.5 text-sm">{report.description}</p>

        {report.expected_solution ? (
          <div className="mt-2 rounded-2xl border border-border/70 bg-surface/50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              {EXPECTED_SOLUTION_TITLE}
            </p>
            <p className="mt-0.5 text-sm">{report.expected_solution}</p>
          </div>
        ) : null}

        {report.photos.length > 0 ? (
          <ul className="mt-2 flex gap-2">
            {report.photos.map((photo, photoIndex) => (
              <li key={photo.thumb_url}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external thumb host not in next/image allowlist yet */}
                <img
                  src={photo.thumb_url}
                  alt={photo.alt || `Foto ${photoIndex + 1} del reporte`}
                  className="size-16 rounded-2xl border border-border object-cover"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-text-secondary">{NO_PHOTO}</p>
        )}

        <div className="mt-3 rounded-2xl border border-border/60 bg-surface/50 p-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 shrink-0 rounded-full bg-accent-agua"
            />
            <h3 className="text-sm font-semibold">{SOLUTIONS_TITLE}</h3>
            <span className="tabular ml-auto text-[11px] text-text-secondary">
              {solutions.length}
            </span>
          </div>
          <p className="mt-0.5 pl-4 text-[11px] text-text-secondary">
            {SOLUTIONS_DATA_WARNING}
          </p>

          {solutions.length === 0 ? (
            <p className="mt-2 pl-4 text-sm text-text-secondary">
              Todavía no hay soluciones aportadas para este reporte.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {solutions.map((solution) => (
                <li
                  key={solution.id}
                  className="rounded-2xl border border-border/60 bg-card/40 p-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        solution.status === "approved"
                          ? "rounded-full bg-accent-green/15 px-2 py-0.5 text-[11px] font-medium text-accent-green"
                          : "rounded-full bg-alerta-moderada/15 px-2 py-0.5 text-[11px] font-medium text-alerta-moderada"
                      }
                    >
                      {solution.status === "approved"
                        ? SOLUTION_APPROVED_LABEL
                        : SOLUTION_PENDING_LABEL}
                    </span>
                    <time
                      dateTime={solution.created_at}
                      className="tabular text-[11px] text-text-secondary"
                    >
                      {formatRelativeAge(solution.created_at)}
                    </time>
                    {solution.author_label ? (
                      <span className="text-[11px] text-text-secondary">
                        · {solution.author_label}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm">{solution.text}</p>
                  {solution.evidence_note ? (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {solution.evidence_note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <SolutionForm onSubmit={onSubmitSolution} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <UpdatedAt timestamp={report.updated_at} />
          <ShareCopyButton
            path={sharePath}
            text={`${report.summary} · ${CATEGORY_LABELS[report.category]} · Formosa`}
            label="Compartir reporte"
          />
        </div>
      </div>
    </section>
  );
}
