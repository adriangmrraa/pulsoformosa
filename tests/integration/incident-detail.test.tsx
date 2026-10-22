import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IncidentDetailSheet } from "@/components/reports/incident-detail-sheet";
import { REPORTS_FIXTURE } from "@/tests/fixtures/reports.fixture";

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
});
