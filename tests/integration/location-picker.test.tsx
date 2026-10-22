import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocationPicker } from "@/components/reports/location-picker";
import { GPS_DENIED, OUTSIDE_REGION_ERROR } from "@/lib/domain/microcopy";

const getCurrentPosition = vi.fn();

beforeEach(() => {
  getCurrentPosition.mockReset();
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition },
  });
});

describe("LocationPicker", () => {
  it("requests geolocation only on user action", () => {
    render(<LocationPicker value={null} method={null} onChange={vi.fn()} />);
    expect(getCurrentPosition).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Usar mi ubicación" }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it("falls back to the manual path when GPS is denied", () => {
    getCurrentPosition.mockImplementation((_ok, fail) => {
      fail({ code: 1 });
    });

    render(<LocationPicker value={null} method={null} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Usar mi ubicación" }));

    expect(screen.getByText(GPS_DENIED)).toBeInTheDocument();
    expect(screen.getByLabelText("Latitud")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitud")).toBeInTheDocument();
    expect(screen.getByLabelText("Barrio o referencia")).toBeInTheDocument();
  });

  it("keeps the data and explains when the manual point is outside Formosa", () => {
    const onChange = vi.fn();
    render(
      <LocationPicker
        value={null}
        method={null}
        onChange={onChange}
        barrio="Centro"
        onBarrioChange={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "No compartir mi ubicación actual; seleccionar otro lugar",
      }),
    );
    fireEvent.change(screen.getByLabelText("Latitud"), {
      target: { value: "-34.6" },
    });
    fireEvent.change(screen.getByLabelText("Longitud"), {
      target: { value: "-58.4" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(OUTSIDE_REGION_ERROR);
    expect(screen.getByLabelText("Latitud")).toHaveValue("-34.6");
  });

  it("emits a manual pin inside the Formosa bbox", () => {
    const onChange = vi.fn();
    render(<LocationPicker value={null} method={null} onChange={onChange} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "No compartir mi ubicación actual; seleccionar otro lugar",
      }),
    );
    fireEvent.change(screen.getByLabelText("Latitud"), {
      target: { value: "-26.18" },
    });
    fireEvent.change(screen.getByLabelText("Longitud"), {
      target: { value: "-58.18" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));

    expect(onChange).toHaveBeenCalledWith(
      { lat: -26.18, lon: -58.18 },
      "manual_pin",
    );
  });
});
