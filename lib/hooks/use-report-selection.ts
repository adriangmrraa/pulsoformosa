"use client";

import { useCallback, useMemo, useState } from "react";
import type { PublicReport } from "@/lib/domain/report";
import {
  deriveReportStatus,
  type DerivedReportStatus,
  type Solution,
} from "@/lib/domain/solution";
import type { SolutionFormInput } from "@/lib/validation/solution-form";

export interface UseReportSelectionArgs {
  /** Selection dataset: filtered reports union the resolved deep-link report. */
  reports: PublicReport[];
  solutions?: Solution[];
  initialReportId?: string;
  /** Transport seam — defaults to the real POST; tests inject the handler. */
  submitSolution?: SubmitSolutionFn;
}

function byCreatedAtDesc(a: PublicReport, b: PublicReport): number {
  return Date.parse(b.created_at) - Date.parse(a.created_at);
}

/**
 * Keeps the URL shareable without a navigation: every selection source
 * (pin, prev/next, swipe, deep link) funnels through `select`, which writes
 * `?reporte=` while preserving the active filter params.
 */
function syncReportParam(reportId: string | null): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (reportId) {
    params.set("reporte", reportId);
  } else {
    params.delete("reporte");
  }
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
}

/**
 * Real transport: POST /api/reportes/[id]/soluciones. The server persists the
 * contribution with status "pending" and returns the stored row.
 */
export async function postSolution(
  reportId: string,
  input: SolutionFormInput,
): Promise<Solution> {
  const response = await fetch(
    `/api/reportes/${encodeURIComponent(reportId)}/soluciones`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!response.ok) {
    throw new Error(`solution submit failed: ${response.status}`);
  }
  return (await response.json()) as Solution;
}

export type SubmitSolutionFn = typeof postSolution;

/**
 * Single source of truth for the selected report on the map-first home
 * (pattern: demobondis use-line-first-selection). The map, the detail panel,
 * the swipe stage and the URL all converge on this state — no component keeps
 * a second selection.
 */
export function useReportSelection({
  reports,
  solutions = [],
  initialReportId,
  submitSolution = postSolution,
}: UseReportSelectionArgs) {
  const ordered = useMemo(() => [...reports].sort(byCreatedAtDesc), [reports]);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (
      initialReportId &&
      ordered.some((report) => report.id === initialReportId)
    ) {
      return initialReportId;
    }
    return ordered[0]?.id ?? null;
  });

  const [optimisticSolutions, setOptimisticSolutions] = useState<Solution[]>(
    [],
  );
  // Server props arrive via router.refresh() after a POST — dedupe by id so a
  // persisted row never shows twice next to its optimistic copy.
  const allSolutions = useMemo(() => {
    const serverIds = new Set(solutions.map((item) => item.id));
    return [
      ...solutions,
      ...optimisticSolutions.filter((item) => !serverIds.has(item.id)),
    ];
  }, [solutions, optimisticSolutions]);

  const selectedIndex = ordered.findIndex(
    (report) => report.id === selectedId,
  );
  const selectedReport =
    selectedIndex >= 0 ? (ordered[selectedIndex] ?? null) : null;

  const select = useCallback(
    (id: string) => {
      if (!ordered.some((report) => report.id === id)) return;
      setSelectedId(id);
      syncReportParam(id);
    },
    [ordered],
  );

  const canPrev = selectedIndex > 0;
  const canNext = selectedIndex >= 0 && selectedIndex < ordered.length - 1;

  const next = useCallback(() => {
    if (!canNext) return;
    select(ordered[selectedIndex + 1]!.id);
  }, [canNext, ordered, selectedIndex, select]);

  const prev = useCallback(() => {
    if (!canPrev) return;
    select(ordered[selectedIndex - 1]!.id);
  }, [canPrev, ordered, selectedIndex, select]);

  /** Public view: rejected contributions never reach the panel (PNL-04). */
  const solutionsFor = useCallback(
    (reportId: string): Solution[] =>
      allSolutions
        .filter(
          (item) => item.report_id === reportId && item.status !== "rejected",
        )
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [allSolutions],
  );

  const statusFor = useCallback(
    (reportId: string): DerivedReportStatus =>
      deriveReportStatus({ id: reportId }, allSolutions),
    [allSolutions],
  );

  const countFor = useCallback(
    (reportId: string): number => solutionsFor(reportId).length,
    [solutionsFor],
  );

  const addSolution = useCallback(
    async (reportId: string, input: SolutionFormInput): Promise<Solution> => {
      const created = await submitSolution(reportId, input);
      setOptimisticSolutions((current) => [...current, created]);
      return created;
    },
    [submitSolution],
  );

  return {
    ordered,
    selectedId,
    selectedReport,
    selectedIndex,
    total: ordered.length,
    canPrev,
    canNext,
    select,
    next,
    prev,
    solutionsFor,
    statusFor,
    countFor,
    addSolution,
  };
}

export type ReportSelectionState = ReturnType<typeof useReportSelection>;
