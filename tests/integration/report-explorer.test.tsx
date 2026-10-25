import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { useEffect, useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReportExplorer } from "@/components/home/report-explorer";
import type { PublicReport } from "@/lib/domain/report";
import type { Solution } from "@/lib/domain/solution";
import { getStore, resetStoreForTests } from "@/lib/server/store";
import { submitSolutionViaRoute } from "@/tests/helpers/real-handlers";
import { REPORTS_FIXTURE } from "@/tests/fixtures/reports.fixture";
import { SOLUTIONS_FIXTURE } from "@/tests/fixtures/solutions.fixture";

const LATEST = "rpt_mock_9f3a1b";
const SOLVED = "rpt_mock_e4f6a2";

/**
 * next/navigation is a framework boundary jsdom cannot provide. This mock is
 * honest about what it replaces: useSearchParams reads the real location and
 * router.refresh() emits the event the harness uses to re-run the page's real
 * data path (store reads) — it never touches the transport under test.
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: () => window.dispatchEvent(new Event("test:router-refresh")),
    replace: (href: string) => window.history.replaceState(null, "", href),
    push: (href: string) => window.history.pushState(null, "", href),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

async function loadFromStore(): Promise<{
  reports: PublicReport[];
  solutions: Solution[];
}> {
  const store = await getStore();
  const { items } = await store.listReports({
    category: "ALL",
    period: "30d",
    limit: 50,
  });
  const solutions = await store.listSolutions(items.map((item) => item.id));
  return { reports: items, solutions };
}

/**
 * Mirrors the server component: props come from the real store and
 * router.refresh() re-reads them — the same round-trip the page performs.
 */
function ExplorerHarness({ initialReportId }: { initialReportId?: string }) {
  const [data, setData] = useState<{
    reports: PublicReport[];
    solutions: Solution[];
  }>({ reports: [...REPORTS_FIXTURE], solutions: [...SOLUTIONS_FIXTURE] });

  useEffect(() => {
    const reload = () => {
      void loadFromStore().then(setData);
    };
    window.addEventListener("test:router-refresh", reload);
    return () => window.removeEventListener("test:router-refresh", reload);
  }, []);

  return (
    <ReportExplorer
      reports={data.reports}
      solutions={data.solutions}
      initialReportId={initialReportId}
      submitSolution={submitSolutionViaRoute}
    />
  );
}

function panel() {
  return screen.getByRole("region", { name: "Detalle del reporte" });
}

function renderExplorer(initialReportId?: string) {
  return render(<ExplorerHarness initialReportId={initialReportId} />);
}

let dataDir: string;

describe("ReportExplorer", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    dataDir = mkdtempSync(path.join(tmpdir(), "pulso-explorer-test-"));
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

  it("renders the map area first, then the detail panel", async () => {
    renderExplorer();
    const mapRegion = await screen.findByRole("region", {
      name: "Mapa de reportes",
    });
    const detail = panel();
    expect(
      mapRegion.compareDocumentPosition(detail) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("selects the most recent report by default", async () => {
    renderExplorer();
    const detail = panel();
    expect(
      await within(detail).findByRole("heading", {
        name: /Agua acumulada sobre la calzada/,
      }),
    ).toBeInTheDocument();
    expect(within(detail).getByText(/Reporte 1 de 14/)).toBeInTheDocument();
    expect(within(detail).getByText(LATEST)).toBeInTheDocument();
  });

  it("renders one pin button per published report with status labels", async () => {
    renderExplorer();
    await screen.findByRole("region", { name: "Mapa de reportes" });
    // The map chunk loads via next/dynamic — wait for pins to land.
    const pins = await screen.findAllByRole("button", {
      name: /Reporte rpt_mock_/,
    });
    expect(pins).toHaveLength(REPORTS_FIXTURE.length);
    expect(pins[0]).toHaveAccessibleName(/Abierto/);
    expect(
      await screen.findByRole("button", {
        name: new RegExp(`${SOLVED}.*Resuelto`),
      }),
    ).toBeInTheDocument();
  });

  it("switches the panel when a pin is selected", async () => {
    renderExplorer();
    const pin = await screen.findByRole("button", {
      name: new RegExp(SOLVED),
    });
    fireEvent.click(pin);

    const detail = panel();
    expect(
      within(detail).getByRole("heading", {
        name: /Bache profundo en la mano derecha/,
      }),
    ).toBeInTheDocument();
    expect(within(detail).getByText("Resuelto")).toBeInTheDocument();
    expect(
      within(detail).getByText(/Rellenar y compactar el bache/),
    ).toBeInTheDocument();
  });

  it("clamps previous/next navigation without wrapping", async () => {
    renderExplorer();
    panel();
    const prev = screen.getByRole("button", { name: "Reporte anterior" });
    const next = screen.getByRole("button", { name: "Reporte siguiente" });

    expect(prev).toBeDisabled();
    fireEvent.click(prev);
    expect(within(panel()).getByText(/Reporte 1 de 14/)).toBeInTheDocument();

    fireEvent.click(next);
    const detail = panel();
    expect(within(detail).getByText(/Reporte 2 de 14/)).toBeInTheDocument();
    expect(
      within(detail).getByRole("heading", {
        name: /Ingresó agua en una vivienda baja/,
      }),
    ).toBeInTheDocument();
    expect(prev).toBeEnabled();
  });

  it("shows non-rejected solutions and hides rejected ones", async () => {
    renderExplorer(SOLVED);
    const detail = panel();
    const approvedHits = await within(detail).findAllByText(
      /La cuadrilla rellenó el bache y compactó el tramo/,
    );
    expect(approvedHits.length).toBeGreaterThanOrEqual(1);
    expect(within(detail).getByText(/aprobada/i)).toBeInTheDocument();
    expect(
      within(detail).queryByText(/Reclamar al seguro/),
    ).not.toBeInTheDocument();
  });

  it("shows pending contributions with the review label", async () => {
    renderExplorer(LATEST);
    const detail = panel();
    expect(
      await within(detail).findByText(/bomba de achicado/i),
    ).toBeInTheDocument();
    expect(
      within(detail).getByText(/pendiente de revisión/i),
    ).toBeInTheDocument();
  });

  it("persists a submitted solution as pending via the real route", async () => {
    renderExplorer(LATEST);
    const detail = panel();
    const textarea = await within(detail).findByLabelText("Tu solución");
    fireEvent.change(textarea, {
      target: { value: "Limpiar el desagüe y revisar la pendiente de la calle." },
    });
    fireEvent.click(
      within(detail).getByRole("button", { name: "Enviar solución" }),
    );

    // The persisted row renders (optimistic + refreshed props dedupe by id).
    expect(
      await within(detail).findByText(
        /Limpiar el desagüe y revisar la pendiente/,
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    // Still open: a pending contribution never flips the status.
    expect(within(detail).getByText("Abierto")).toBeInTheDocument();

    // router.refresh() re-ran the real store read — same row, no duplicates.
    await waitFor(async () => {
      const hits = await within(detail).findAllByText(
        /Limpiar el desagüe y revisar la pendiente/,
      );
      expect(hits).toHaveLength(1);
    });

    const store = await getStore();
    const persisted = await store.listSolutions([LATEST]);
    expect(
      persisted.some(
        (item) =>
          item.status === "pending" &&
          item.text.startsWith("Limpiar el desagüe"),
      ),
    ).toBe(true);
  });

  it("changes the selection on a committed horizontal swipe", async () => {
    renderExplorer();
    const detail = panel();
    await within(detail).findByRole("heading", {
      name: /Agua acumulada sobre la calzada/,
    });

    const stage = screen.getByTestId("swipe-stage");
    fireEvent.pointerDown(stage, {
      pointerId: 1,
      clientX: 300,
      clientY: 400,
    });
    fireEvent.pointerMove(stage, {
      pointerId: 1,
      clientX: 180,
      clientY: 402,
    });
    fireEvent.pointerUp(stage, {
      pointerId: 1,
      clientX: 120,
      clientY: 402,
    });

    expect(
      within(panel()).getByRole("heading", {
        name: /Ingresó agua en una vivienda baja/,
      }),
    ).toBeInTheDocument();
  });

  it("ignores short or vertical gestures", async () => {
    renderExplorer();
    await within(panel()).findByRole("heading", {
      name: /Agua acumulada sobre la calzada/,
    });
    const stage = screen.getByTestId("swipe-stage");

    // 30px horizontal < 48px commit: no change.
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 200 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 170, clientY: 200 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 170, clientY: 200 });
    expect(
      within(panel()).getByRole("heading", {
        name: /Agua acumulada sobre la calzada/,
      }),
    ).toBeInTheDocument();

    // Vertical lock wins even with a long travel.
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 195, clientY: 250 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 190, clientY: 400 });
    expect(
      within(panel()).getByRole("heading", {
        name: /Agua acumulada sobre la calzada/,
      }),
    ).toBeInTheDocument();
  });

  it("warns that solutions are neighbour contributions", async () => {
    renderExplorer();
    const detail = panel();
    const warnings = await within(detail).findAllByText(/Aporte vecinal/i);
    expect(warnings.length).toBeGreaterThanOrEqual(1);
  });
});
