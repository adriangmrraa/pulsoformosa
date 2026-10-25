"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";
import {
  useReportSelection,
  type SubmitSolutionFn,
} from "@/lib/hooks/use-report-selection";
import type { SolutionFormInput } from "@/lib/validation/solution-form";
import { FORMOSA_BBOX } from "@/lib/domain/geo";
import { IncidentMap } from "@/components/map/incident-map";
import { pinLabel, type MapPin } from "@/components/map/map-pins";
import { EmptyState } from "@/components/home/empty-state";
import { SwipeStage } from "@/components/home/swipe-stage";
import { ReportDetailPanel } from "@/components/home/report-detail-panel";

const FALLBACK_BOUNDS: [[number, number], [number, number]] = [
  [-58.5, -26.5],
  [-57.9, -25.9],
];

interface ReportExplorerProps {
  /** Selection dataset: filtered reports ∪ resolved deep-link, any order. */
  reports: PublicReport[];
  solutions: Solution[];
  initialReportId?: string;
  /** True when rows come from the seeded dev store → keep the mock badge. */
  fixture?: boolean;
  /** Transport seam — defaults to the real POST; tests inject the handler. */
  submitSolution?: SubmitSolutionFn;
}

/**
 * Client shell for the map-first home: one useReportSelection drives the map
 * pins, the detail panel, the swipe gesture and the ?reporte= URL — no second
 * selection state anywhere (REQ-SEL-01).
 */
export function ReportExplorer({
  reports,
  solutions,
  initialReportId,
  fixture = false,
  submitSolution,
}: ReportExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selection = useReportSelection({
    reports,
    solutions,
    initialReportId,
    submitSolution,
  });

  const pins = useMemo<MapPin[]>(
    () =>
      selection.ordered.map((report) => {
        const status = selection.statusFor(report.id);
        return {
          id: report.id,
          lon: report.geometry.coordinates[0],
          lat: report.geometry.coordinates[1],
          status,
          label: pinLabel(report.id, status),
        };
      }),
    [selection],
  );

  const bounds = useMemo((): [[number, number], [number, number]] => {
    if (pins.length === 0) return FALLBACK_BOUNDS;
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
    for (const pin of pins) {
      minLon = Math.min(minLon, pin.lon);
      minLat = Math.min(minLat, pin.lat);
      maxLon = Math.max(maxLon, pin.lon);
      maxLat = Math.max(maxLat, pin.lat);
    }
    // Pad single-pin and tight clusters so fitBounds never zooms to a point.
    const padLon = Math.max((maxLon - minLon) * 0.15, 0.01);
    const padLat = Math.max((maxLat - minLat) * 0.15, 0.01);
    return [
      [
        Math.max(minLon - padLon, FORMOSA_BBOX.minLon),
        Math.max(minLat - padLat, FORMOSA_BBOX.minLat),
      ],
      [
        Math.min(maxLon + padLon, FORMOSA_BBOX.maxLon),
        Math.min(maxLat + padLat, FORMOSA_BBOX.maxLat),
      ],
    ];
  }, [pins]);

  /** Share URL keeps the active filters so shared links restore the state. */
  const sharePath = useMemo(() => {
    if (!selection.selectedId) return "/";
    const params = new URLSearchParams(searchParams.toString());
    params.set("reporte", selection.selectedId);
    return `/?${params.toString()}`;
  }, [searchParams, selection.selectedId]);

  const handleSubmitSolution = useCallback(
    async (input: SolutionFormInput) => {
      if (!selection.selectedId) {
        throw new Error("no report selected");
      }
      const created = await selection.addSolution(
        selection.selectedId,
        input,
      );
      // Revalidate the server-rendered props so the persisted pending
      // solution survives reloads and other sessions.
      router.refresh();
      return created;
    },
    [selection, router],
  );

  return (
    <div>
      <IncidentMap
        pins={pins}
        bounds={bounds}
        selectedId={selection.selectedId}
        onSelect={selection.select}
      />

      <SwipeStage
        onSwipeLeft={selection.next}
        onSwipeRight={selection.prev}
        className="mt-0"
      >
        {selection.selectedReport ? (
          <ReportDetailPanel
            report={selection.selectedReport}
            index={selection.selectedIndex}
            total={selection.total}
            status={selection.statusFor(selection.selectedReport.id)}
            solutions={selection.solutionsFor(selection.selectedReport.id)}
            canPrev={selection.canPrev}
            canNext={selection.canNext}
            onPrev={selection.prev}
            onNext={selection.next}
            fixture={fixture}
            sharePath={sharePath}
            onSubmitSolution={handleSubmitSolution}
          />
        ) : (
          <div className="container-page py-6">
            <EmptyState />
          </div>
        )}
      </SwipeStage>
    </div>
  );
}
