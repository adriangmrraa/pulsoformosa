import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";
import { IncidentCard } from "@/components/reports/incident-card";
import { REPORTS_FIXTURE } from "@/tests/fixtures/reports.fixture";
import { NO_PHOTO } from "@/lib/domain/microcopy";

describe("DevMockBadge", () => {
  it("renders the verbatim mock label as text, not color only", () => {
    render(<DevMockBadge />);
    expect(
      screen.getByText("Dato de prueba — mock de desarrollo"),
    ).toBeInTheDocument();
  });

  it("renders an icon alongside the text", () => {
    const { container } = render(<DevMockBadge />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("is present on every fixture-fed incident card", () => {
    for (const report of REPORTS_FIXTURE.slice(0, 3)) {
      const { unmount } = render(
        <IncidentCard
          report={report}
          fixture
          sharePath={`/?reporte=${report.id}`}
          status="open"
          solutionCount={0}
        />,
      );
      expect(
        screen.getByText("Dato de prueba — mock de desarrollo"),
      ).toBeInTheDocument();
      expect(screen.getByText(NO_PHOTO)).toBeInTheDocument();
      unmount();
    }
  });
});
