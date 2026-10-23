import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IncidentDetailSheet } from "@/components/reports/incident-detail-sheet";
import {
  HIDDEN_REPORT_FIXTURE,
  REPORTS_FIXTURE,
} from "@/tests/fixtures/reports.fixture";
import { REPORT_PENDING_LINE } from "@/lib/domain/microcopy";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("reporte=rpt_mock_9f3a1b"),
}));

describe("IncidentDetailSheet", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("opens with the §11.2 detail fields", () => {
    const report = REPORTS_FIXTURE[0];
    render(<IncidentDetailSheet report={report} open />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(report.description)).toBeInTheDocument();
    expect(
      screen.getByText("Reportado por un vecino — no verificado"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Enviado:/)).toBeInTheDocument();
    expect(screen.getByText(/Punto aproximado/)).toBeInTheDocument();
    expect(
      screen.getByText("Dato de prueba — mock de desarrollo"),
    ).toBeInTheDocument();
  });

  it("shows the verified label for an editorially verified report", () => {
    const verified = REPORTS_FIXTURE.find(
      (report) => report.editorial_status === "VERIFIED_EDITORIALLY",
    );
    expect(verified).toBeDefined();
    if (!verified) return;
    render(<IncidentDetailSheet report={verified} open />);
    expect(screen.getByText("Corroborado")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<IncidentDetailSheet report={REPORTS_FIXTURE[0]} open onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("offers copy and share actions but no flag action", () => {
    render(<IncidentDetailSheet report={REPORTS_FIXTURE[0]} open />);
    expect(
      screen.getByRole("button", { name: "Copiar enlace de este reporte" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Reportar contenido inadecuado/i),
    ).toBeNull();
  });

  it("renders an unavailable message when the report is null", () => {
    render(<IncidentDetailSheet report={null} open />);
    expect(screen.getByText("Reporte no disponible")).toBeInTheDocument();
  });

  it("never leaks hidden report content", () => {
    render(<IncidentDetailSheet report={HIDDEN_REPORT_FIXTURE} open />);
    expect(screen.getByText("Reporte no disponible")).toBeInTheDocument();
    expect(
      screen.queryByText(HIDDEN_REPORT_FIXTURE.description),
    ).toBeNull();
    expect(screen.queryByText(/Enviado:/)).toBeNull();
    expect(screen.queryByText(/Zona:/)).toBeNull();
  });

  it("shows only the moderating line for a pending report", () => {
    render(
      <IncidentDetailSheet
        report={{ ...REPORTS_FIXTURE[0], editorial_status: "PENDING_REVIEW" }}
        open
      />,
    );
    expect(screen.getByText("Reporte en revisión")).toBeInTheDocument();
    expect(screen.getByText(REPORT_PENDING_LINE)).toBeInTheDocument();
    expect(screen.queryByText(REPORTS_FIXTURE[0].description)).toBeNull();
  });
});
