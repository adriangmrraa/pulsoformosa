import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReportSelection } from "@/lib/hooks/use-report-selection";
import { resetStoreForTests } from "@/lib/server/store";
import { submitSolutionViaRoute } from "@/tests/helpers/real-handlers";
import { REPORTS_FIXTURE } from "@/tests/fixtures/reports.fixture";
import { SOLUTIONS_FIXTURE } from "@/tests/fixtures/solutions.fixture";

const SOLVED_REPORT = "rpt_mock_e4f6a2";
const LATEST_REPORT = "rpt_mock_9f3a1b";
const SECOND_LATEST = "rpt_mock_c7d2e4";

function renderSelection(
  overrides: Partial<Parameters<typeof useReportSelection>[0]> = {},
) {
  return renderHook((props: Parameters<typeof useReportSelection>[0]) =>
    useReportSelection(props),
  {
    initialProps: {
      reports: [...REPORTS_FIXTURE],
      solutions: [...SOLUTIONS_FIXTURE],
      ...overrides,
    },
  });
}

let dataDir: string;

describe("useReportSelection", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    // Real JSON store on disk — addSolution goes through the actual route
    // handler and persists (amendment: no fetch mocks, no stubbed seams).
    dataDir = mkdtempSync(path.join(tmpdir(), "pulso-hook-test-"));
    vi.stubEnv("PULSO_DATA_DIR", dataDir);
    vi.stubEnv("PULSO_SEED_DEMO", "1");
    vi.stubEnv("PUBLIC_ENVIRONMENT_LABEL", "development");
    delete process.env.DATABASE_URL;
    resetStoreForTests();
  });

  afterEach(() => {
    resetStoreForTests();
    vi.unstubAllEnvs();
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("selects the latest report by default (max created_at)", () => {
    // Shuffle input: the hook must sort internally, not trust prop order.
    const shuffled = [...REPORTS_FIXTURE].reverse();
    const { result } = renderSelection({ reports: shuffled });
    expect(result.current.selectedReport?.id).toBe(LATEST_REPORT);
    expect(result.current.selectedIndex).toBe(0);
  });

  it("honours an initialReportId even when it is not the latest", () => {
    const { result } = renderSelection({ initialReportId: SOLVED_REPORT });
    expect(result.current.selectedReport?.id).toBe(SOLVED_REPORT);
  });

  it("falls back to the latest when initialReportId is unknown", () => {
    const { result } = renderSelection({ initialReportId: "rpt_mock_nope" });
    expect(result.current.selectedReport?.id).toBe(LATEST_REPORT);
  });

  it("moves next/previous along the sorted order and clamps at the edges", () => {
    const { result } = renderSelection();
    expect(result.current.canPrev).toBe(false);
    expect(result.current.canNext).toBe(true);

    act(() => result.current.prev()); // clamped: stays at index 0
    expect(result.current.selectedReport?.id).toBe(LATEST_REPORT);

    act(() => result.current.next());
    expect(result.current.selectedReport?.id).toBe(SECOND_LATEST);
    expect(result.current.canPrev).toBe(true);

    const last = REPORTS_FIXTURE.length - 1;
    for (let index = 0; index < last + 3; index += 1) {
      act(() => result.current.next());
    }
    expect(result.current.selectedIndex).toBe(last);
    expect(result.current.canNext).toBe(false);
  });

  it("writes ?reporte= to the URL preserving existing filter params", () => {
    window.history.replaceState(
      null,
      "",
      "/?zona=centro&categoria=agua&periodo=30d",
    );
    const { result } = renderSelection();
    act(() => result.current.select(SECOND_LATEST));

    const params = new URLSearchParams(window.location.search);
    expect(params.get("reporte")).toBe(SECOND_LATEST);
    expect(params.get("zona")).toBe("centro");
    expect(params.get("categoria")).toBe("agua");
    expect(params.get("periodo")).toBe("30d");
  });

  it("derives solved only from approved solutions", () => {
    const { result } = renderSelection();
    expect(result.current.statusFor(SOLVED_REPORT)).toBe("solved");
    expect(result.current.statusFor(LATEST_REPORT)).toBe("open");
  });

  it("exposes non-rejected solutions for the panel", () => {
    const { result } = renderSelection();
    const rejected = result.current.solutionsFor("rpt_mock_c7d2e4");
    expect(rejected.some((item) => item.status === "rejected")).toBe(false);
    expect(result.current.countFor(SOLVED_REPORT)).toBe(1);
  });

  it("persists a pending solution via addSolution (real route + store)", async () => {
    const { result } = renderSelection({
      submitSolution: submitSolutionViaRoute,
    });
    const before = result.current.countFor(LATEST_REPORT);

    let created: Awaited<ReturnType<typeof result.current.addSolution>> | null =
      null;
    await act(async () => {
      created = await result.current.addSolution(LATEST_REPORT, {
        text: "Habilitar una bomba de achicado en la esquina.",
      });
    });

    expect(created).not.toBeNull();
    expect(created!.status).toBe("pending");
    expect(created!.author_anonymous).toBe(true);
    expect(created!.report_id).toBe(LATEST_REPORT);
    expect(created!.id).toMatch(/^sol_[0-9a-f]{10}$/);
    expect(result.current.countFor(LATEST_REPORT)).toBe(before + 1);
    expect(result.current.statusFor(LATEST_REPORT)).toBe("open");

    // Read it back from disk — the optimistic row is a persisted row.
    const store = await (await import("@/lib/server/store")).getStore();
    const persisted = await store.listSolutions([LATEST_REPORT]);
    expect(persisted.some((item) => item.id === created!.id)).toBe(true);
  });
});
