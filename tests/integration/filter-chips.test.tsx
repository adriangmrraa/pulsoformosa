import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterChips } from "@/components/home/filter-chips";
import { TimeRangeSelector } from "@/components/home/time-range-selector";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("zona=norte"),
}));

describe("FilterChips", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("writes the category slug to the query string", () => {
    render(<FilterChips active="todos" />);
    fireEvent.click(screen.getByRole("radio", { name: "Calles" }));
    expect(replaceMock).toHaveBeenCalledWith("/?zona=norte&categoria=calles", {
      scroll: false,
    });
  });

  it("removes the category param when Todos is selected", () => {
    render(<FilterChips active="calles" />);
    fireEvent.click(screen.getByRole("radio", { name: "Todos" }));
    expect(replaceMock).toHaveBeenCalledWith("/?zona=norte", { scroll: false });
  });

  it("shows the subtype row only while Agua is active", () => {
    const { rerender } = render(<FilterChips active="agua" />);
    expect(
      screen.getByRole("radiogroup", { name: "Subtipo de agua" }),
    ).toBeInTheDocument();

    rerender(<FilterChips active="todos" />);
    expect(
      screen.queryByRole("radiogroup", { name: "Subtipo de agua" }),
    ).toBeNull();
  });

  it("writes the subtype when a subtype chip is selected", () => {
    render(<FilterChips active="agua" />);
    fireEvent.click(
      screen.getByRole("radio", { name: "calle anegada" }),
    );
    expect(replaceMock).toHaveBeenCalledWith(
      "/?zona=norte&subtipo=calle+anegada",
      { scroll: false },
    );
  });

  it("exposes radiogroup semantics and checked state", () => {
    render(<FilterChips active="servicios" />);
    const group = screen.getByRole("radiogroup", { name: "Categoría" });
    expect(group).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Servicios" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});

describe("TimeRangeSelector", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("writes the period to the query string", () => {
    render(<TimeRangeSelector value="7d" />);
    fireEvent.click(screen.getByRole("radio", { name: "30 días" }));
    expect(replaceMock).toHaveBeenCalledWith("/?zona=norte&periodo=30d", {
      scroll: false,
    });
  });

  it("removes the period param when the 7d default is selected", () => {
    render(<TimeRangeSelector value="30d" />);
    fireEvent.click(screen.getByRole("radio", { name: "7 días" }));
    expect(replaceMock).toHaveBeenCalledWith("/?zona=norte", { scroll: false });
  });
});
