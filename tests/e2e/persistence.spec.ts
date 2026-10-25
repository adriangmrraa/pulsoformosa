/**
 * Real-persistence E2E (design-amendment obs #5628). Every assertion below is
 * a real HTTP round trip against the production build backed by the JSON
 * store spawned by playwright.config.ts — no fetch mocks, no seeded UI state.
 */
import { expect, test, type APIRequestContext } from "@playwright/test";
import { gotoHydrated } from "./helpers";
import { E2E_MODERATOR_TOKEN } from "./env";

interface ReportPageBody {
  items: Array<{
    id: string;
    description: string;
    geometry: { coordinates: [number, number] };
    editorial_status: string;
  }>;
  total: number;
}

function reportPayload() {
  return {
    category: "WATER",
    description:
      "Cruza agua por la calle desde la madrugada y llega a las puertas.",
    expected_solution: "Que destapen y reperfílen el desagüe de la esquina.",
    location: { lat: -26.1849, lon: -58.1731, method: "manual_pin" },
    zone_label: "Centro",
    geometry_mode: "POINT",
    consent: true,
    idempotency_key: crypto.randomUUID(),
  };
}

async function createReport(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/reportes", {
    data: reportPayload(),
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.public_id).toMatch(/^rpt_[0-9a-f]{10}$/);
  return body.public_id as string;
}

test.describe("GET /api/reportes (real HTTP)", () => {
  test("returns public reports with generalized coordinates only", async ({
    request,
  }) => {
    const response = await request.get("/api/reportes?periodo=30d");
    expect(response.status()).toBe(200);
    const page = (await response.json()) as ReportPageBody;
    expect(page.items.length).toBeGreaterThan(0);
    for (const item of page.items) {
      expect(["PUBLISHED_UNVERIFIED", "VERIFIED_EDITORIALLY"]).toContain(
        item.editorial_status,
      );
      const [lon, lat] = item.geometry.coordinates;
      for (const value of [lon, lat]) {
        expect(
          Math.abs(value / 0.0023 - Math.round(value / 0.0023)),
        ).toBeLessThan(1e-6);
      }
    }
  });
});

test.describe("report → map round trip", () => {
  test("a submitted report appears in the feed and on the map", async ({
    page,
    request,
  }) => {
    const publicId = await createReport(request);

    // Feed endpoint serves it (newest rows sort first — page 1 suffices).
    const feed = await request.get(`/api/reportes?periodo=30d`);
    const body = (await feed.json()) as ReportPageBody;
    expect(body.items.some((item) => item.id === publicId)).toBe(true);

    // Deep link renders the real row and its pin.
    await gotoHydrated(page, `/?reporte=${publicId}&periodo=30d`);
    const detail = page.getByRole("region", { name: "Detalle del reporte" });
    await expect(detail).toContainText(
      "Cruza agua por la calle desde la madrugada",
    );
    await expect(detail).toContainText(
      "Que destapen y reperfílen el desagüe",
    );
    await expect(detail).toContainText("Abierto");
    await expect(
      page.locator(`[data-report-pin="${publicId}"]`).first(),
    ).toBeVisible();
  });

  test("the reportar form persists through the real API", async ({ page }) => {
    await gotoHydrated(page, "/reportar");
    await page.getByRole("radio", { name: "Agua y anegamientos" }).click();
    await page
      .getByLabel("Descripción")
      .fill("Esquina inundada frente a la plaza San Martín.");
    await page
      .getByRole("button", {
        name: "No compartir mi ubicación actual; seleccionar otro lugar",
      })
      .click();
    await page.getByLabel("Latitud").fill("-26.185");
    await page.getByLabel("Longitud").fill("-58.174");
    await page.getByRole("button", { name: "Confirmar ubicación" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Enviar reporte" }).click();

    await expect(
      page.getByRole("heading", { name: "Recibimos tu reporte" }),
    ).toBeVisible({ timeout: 8_000 });

    const idText = await page
      .getByText(/rpt_[0-9a-f]{10}/)
      .textContent();
    const publicId = idText?.match(/rpt_[0-9a-f]{10}/)?.[0];
    expect(publicId).toBeTruthy();

    await gotoHydrated(page, `/?reporte=${publicId}&periodo=30d`);
    const detail = page.getByRole("region", { name: "Detalle del reporte" });
    await expect(detail).toContainText("Esquina inundada frente a la plaza");
    await expect(
      page.locator(`[data-report-pin="${publicId}"]`).first(),
    ).toBeVisible();
  });
});

test.describe("solutions and moderation (real HTTP)", () => {
  test("a solution submits as pending and moderation flips the pin to solved", async ({
    page,
    request,
  }) => {
    const reportId = await createReport(request);

    // Anonymous contribution through the real route.
    const submitted = await request.post(
      `/api/reportes/${reportId}/soluciones`,
      {
        data: {
          text: "La cuadrilla ya destapó el desagüe y quedó funcionando.",
        },
      },
    );
    expect(submitted.status()).toBe(201);
    const solution = await submitted.json();
    expect(solution.status).toBe("pending");

    // Pending is visible on the page; the report stays open.
    await gotoHydrated(page, `/?reporte=${reportId}&periodo=30d`);
    const detail = page.getByRole("region", { name: "Detalle del reporte" });
    await expect(detail).toContainText(
      "La cuadrilla ya destapó el desagüe",
    );
    await expect(detail).toContainText("pendiente de revisión");
    await expect(detail).toContainText("Abierto");

    // Moderation requires the token.
    const unauthorized = await request.post(
      `/api/soluciones/${solution.id}/moderate`,
      { data: { action: "approve", reason: "Verificado." } },
    );
    expect(unauthorized.status()).toBe(401);

    const approved = await request.post(
      `/api/soluciones/${solution.id}/moderate`,
      {
        data: { action: "approve", reason: "Verificado en terreno." },
        headers: { "x-moderator-token": E2E_MODERATOR_TOKEN },
      },
    );
    expect(approved.status()).toBe(200);
    const moderated = await approved.json();
    expect(moderated.solution.status).toBe("approved");
    expect(moderated.events).toHaveLength(1);

    // Reload: the pin is solved-green and the panel shows the approval.
    await gotoHydrated(page, `/?reporte=${reportId}&periodo=30d`);
    await expect(
      page.getByRole("button", {
        name: new RegExp(`${reportId}.*Resuelto`),
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Detalle del reporte" }),
    ).toContainText("Resuelto");
    await expect(
      page.getByRole("region", { name: "Detalle del reporte" }),
    ).toContainText("aprobada");
  });
});
