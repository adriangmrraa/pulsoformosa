import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

const SNAPSHOTS = "test-results/snapshots";

test.beforeAll(() => {
  mkdirSync(SNAPSHOTS, { recursive: true });
});

test("denied geolocation falls back to manual entry and the fake submit confirms", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: unknown,
          failure?: (error: { code: number }) => void,
        ) => {
          failure?.({ code: 1 });
        },
      },
    });
  });

  await gotoHydrated(page, "/reportar");

  await page.getByRole("button", { name: "Usar mi ubicación" }).click();
  await expect(
    page.getByText("Podés marcar la ubicación manualmente"),
  ).toBeVisible();

  await page.getByRole("radio", { name: "Agua y anegamientos" }).click();

  await page.getByLabel("Descripción").focus();
  await page
    .getByLabel("Descripción")
    .fill("Agua acumulada sobre la calle desde anoche.");
  await page.getByLabel("Latitud").fill("-26.18");
  await page.getByLabel("Longitud").fill("-58.18");
  await page.getByRole("button", { name: "Confirmar ubicación" }).click();

  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enviar reporte" }).click();

  await expect(
    page.getByRole("heading", { name: "Recibimos tu reporte" }),
  ).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText("En revisión", { exact: true })).toBeVisible();
  await expect(page.getByText(/pub_mock_/)).toBeVisible();
  await expect(
    page.getByText(
      "Esto no es un servicio de emergencias ni una denuncia formal ante una autoridad.",
    ),
  ).toBeVisible();

  await page.screenshot({
    path: `${SNAPSHOTS}/reportar-confirmacion-390x844.png`,
    fullPage: true,
  });
});

test("the report page is reachable and captures a mobile snapshot", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoHydrated(page, "/reportar");
  await expect(
    page.getByRole("heading", { name: "Reportar un problema" }),
  ).toBeVisible();
  await page.screenshot({
    path: `${SNAPSHOTS}/reportar-390x844.png`,
    fullPage: true,
  });
});

test("captures the desktop report snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoHydrated(page, "/reportar");
  await expect(
    page.getByRole("heading", { name: "Reportar un problema" }),
  ).toBeVisible();
  await page.screenshot({
    path: `${SNAPSHOTS}/reportar-1440x900.png`,
    fullPage: true,
  });
});
