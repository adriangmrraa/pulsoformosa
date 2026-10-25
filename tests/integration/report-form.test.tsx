import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReportForm } from "@/components/reports/report-form";
import { ImageUploader } from "@/components/reports/image-uploader";
import {
  CONFIRMATION_DISCLAIMER,
  CONFIRMATION_STATUS,
  CONFIRMATION_TITLE,
} from "@/lib/domain/microcopy";

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
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

  it("reads the Turnstile site-key presence without verifying anything", () => {
    const { unmount } = render(<ReportForm />);
    expect(
      screen.getByText("Protección anti-bots no configurada en este entorno."),
    ).toBeInTheDocument();
    unmount();

    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key-test");
    render(<ReportForm />);
    expect(
      screen.getByText(
        "Espacio reservado para la verificación anti-bots (configurado).",
      ),
    ).toBeInTheDocument();
  });

  it("does not ask for name, DNI, email or phone", () => {
    render(<ReportForm />);
    expect(screen.queryByLabelText(/nombre/i)).toBeNull();
    expect(screen.queryByLabelText(/dni/i)).toBeNull();
    expect(screen.queryByLabelText(/email|correo/i)).toBeNull();
    expect(screen.queryByLabelText(/teléfono/i)).toBeNull();
  });

  it("renders the optional expected-solution field right after description", () => {
    render(<ReportForm />);
    const field = screen.getByLabelText("¿Cómo se solucionaría? (opcional)");
    expect(field).toBeInTheDocument();

    const description = screen.getByLabelText("Descripción");
    const position = description.compareDocumentPosition(field);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows a friendly counter for the expected-solution field", () => {
    render(<ReportForm />);
    const field = screen.getByLabelText("¿Cómo se solucionaría? (opcional)");
    fireEvent.change(field, { target: { value: "Asfalto." } });
    expect(screen.getByText("8/280")).toBeInTheDocument();
  });

  it("rejects an expected solution beyond 280 characters on submit", () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.change(
      screen.getByLabelText("¿Cómo se solucionaría? (opcional)"),
      { target: { value: "a".repeat(281) } },
    );
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));
    expect(
      screen.getByText(
        "La solución esperada no puede superar los 280 caracteres.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reporte enviado" }),
    ).toBeNull();
  });

  it("submits successfully with the expected-solution field empty", async () => {
    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));
    expect(
      await screen.findByText(CONFIRMATION_TITLE, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
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

  it("keeps the idempotency key in the submit payload", async () => {
    const key = "12345678-1234-4123-8123-123456789012";
    vi.spyOn(crypto, "randomUUID").mockReturnValue(key);

    render(<ReportForm />);
    pickCategory();
    setDescription("Agua acumulada sobre la calle desde anoche.");
    setManualLocation();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Enviar reporte" }));

    expect(
      await screen.findByText(/pub_mock_12345678/, {}, { timeout: 3000 }),
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
    expect(
      screen.getByRole("button", { name: "Reporte enviado" }),
    ).toBeDisabled();
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

describe("ImageUploader", () => {
  it("explains rejected file types instead of dropping them", () => {
    render(<ImageUploader files={[]} onChange={vi.fn()} />);
    const input = screen.getByLabelText("Elegir fotos del reporte") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [new File(["x"], "nota.txt", { type: "text/plain" })],
    });
    fireEvent.change(input);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Algunos archivos no son JPEG, PNG o HEIC",
    );
  });

  it("explains the three-photo limit", () => {
    render(<ImageUploader files={[]} onChange={vi.fn()} />);
    const files = [1, 2, 3, 4].map(
      (index) => new File(["x"], `foto-${index}.png`, { type: "image/png" }),
    );
    const input = screen.getByLabelText("Elegir fotos del reporte") as HTMLInputElement;
    Object.defineProperty(input, "files", { configurable: true, value: files });
    fireEvent.change(input);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Podés adjuntar hasta 3 fotos.",
    );
  });

  it("renders the uploading state", () => {
    render(<ImageUploader files={[]} onChange={vi.fn()} uploading />);
    expect(screen.getByRole("status")).toHaveTextContent("Subiendo fotos…");
  });

  it("surfaces uploader errors back through the form", () => {
    render(<ReportForm />);
    const input = screen.getByLabelText("Elegir fotos del reporte") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [new File(["x"], "nota.txt", { type: "text/plain" })],
    });
    fireEvent.change(input);
    expect(screen.getByText(/Algunos archivos no son JPEG/)).toBeInTheDocument();
  });
});
