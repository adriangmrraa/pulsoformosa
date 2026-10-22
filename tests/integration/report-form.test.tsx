import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportForm } from "@/components/reports/report-form";
import {
  CONFIRMATION_DISCLAIMER,
  CONFIRMATION_STATUS,
  CONFIRMATION_TITLE,
} from "@/lib/domain/microcopy";

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

function pickCategory(name = "Agua y anegamientos") {
  fireEvent.click(screen.getByRole("radio", { name }));
}

function setDescription(value: string) {
  fireEvent.change(screen.getByLabelText("Descripción"), {
    target: { value },
  });
}

function setManualLocation(lat = "-26.18", lon = "-58.18") {
  fireEvent.click(
    screen.getByRole("button", {
      name: "No compartir mi ubicación actual; seleccionar otro lugar",
    }),
  );
  fireEvent.change(screen.getByLabelText("Latitud"), { target: { value: lat } });
  fireEvent.change(screen.getByLabelText("Longitud"), { target: { value: lon } });
  fireEvent.click(screen.getByRole("button", { name: "Confirmar ubicación" }));
}

describe("ReportForm validation", () => {
  it("blocks an empty submit and associates errors with fields", () => {
    render(<ReportForm />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));

    expect(
      screen.getAllByText("Elegí un tipo de problema.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("La descripción debe tener al menos 15 caracteres."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Marcá una ubicación o usá tu ubicación actual."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Necesitamos tu consentimiento para publicar el reporte."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Descripción")).toHaveAttribute(
      "aria-describedby",
      "description-help description-error",
    );
  });

  it("enforces the 15 character minimum", () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("muy corto");
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));
    expect(
      screen.getByText("La descripción debe tener al menos 15 caracteres."),
    ).toBeInTheDocument();
  });

  it("requires consent even when the rest is valid", () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));
    expect(
      screen.getByText("Necesitamos tu consentimiento para publicar el reporte."),
    ).toBeInTheDocument();
  });

  it("keeps street and area geometry disabled-pending", () => {
    render(<ReportForm />);
    expect(screen.getByLabelText(/Un punto/)).not.toBeDisabled();
    expect(screen.getByLabelText(/Un tramo de calle/)).toBeDisabled();
    expect(screen.getByLabelText(/Una zona aproximada/)).toBeDisabled();
  });

  it("does not ask for name, DNI, email or phone", () => {
    render(<ReportForm />);
    expect(screen.queryByLabelText(/nombre/i)).toBeNull();
    expect(screen.queryByLabelText(/dni/i)).toBeNull();
    expect(screen.queryByLabelText(/email|correo/i)).toBeNull();
    expect(screen.queryByLabelText(/teléfono/i)).toBeNull();
  });
});

describe("ReportForm fake submit", () => {
  it("shows the §6.5 confirmation with a mock id", async () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));

    expect(
      await screen.findByText(CONFIRMATION_TITLE, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(CONFIRMATION_STATUS)).toBeInTheDocument();
    expect(screen.getByText(CONFIRMATION_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(/pub_mock_/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver al mapa" }),
    ).toBeInTheDocument();
  });

  it("guards against double submits", async () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.click(screen.getByRole("checkbox"));

    const submit = screen.getByRole("button", { name: "Enviar reporte" });
    fireEvent.click(submit);

    expect(submit).toBeDisabled();
    await screen.findByText(CONFIRMATION_TITLE, {}, { timeout: 3000 });
  });

  it("restores a draft from tab memory", async () => {
    sessionStorage.setItem(
      "reportar-draft-v1",
      JSON.stringify({
        category: "ROADS",
        subtype: "socavón",
        description: "Socavón grande junto al cordón de la vereda.",
        location: { lat: -26.18, lon: -58.18 },
        method: "manual_pin",
        barrio: "Centro",
      }),
    );

    render(<ReportForm />);

    await waitFor(() =>
      expect(screen.getByLabelText("Descripción")).toHaveValue(
        "Socavón grande junto al cordón de la vereda.",
      ),
    );
    expect(
      screen.getByRole("radio", { name: "Calles y rutas" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
