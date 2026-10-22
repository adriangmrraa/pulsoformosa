import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DevMockBadge } from "@/components/ui/dev-mock-badge";

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
});
