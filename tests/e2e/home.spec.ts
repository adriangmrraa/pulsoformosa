import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

const SNAPSHOTS = "test-results/snapshots";

test.beforeAll(() => {
  mkdirSync(SNAPSHOTS, { recursive: true });
});

test.describe("home", () => {
  test("traverses every section and shows the mock badge", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoHydrated(page, "/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Esto se está reportando en Formosa",
    );
    await expect(page.getByText("Para entenderlo rápido")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Contexto ENSO" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Próximas lluvias" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Río Paraguay — Puerto Formosa" }),
    ).toBeVisible();
    await expect(
      page.getByText("Mapa de reportes — próximamente con cartografía provincial"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ver la lista de reportes" }),
    ).toHaveAttribute("href", "#lista-reportes");
    await expect(
      page.getByRole("heading", { name: "Reportes recientes" }),
    ).toBeVisible();
    await expect(
      page.getByText("Dato de prueba — mock de desarrollo").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fuentes y metodología" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Probabilidad de fase El Niño: no representa probabilidad de inundación en tu barrio.",
      ),
    ).toBeVisible();

    await page.screenshot({
      path: `${SNAPSHOTS}/home-1440x900.png`,
      fullPage: true,
    });
  });

  test("renders at mobile width without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHydrated(page, "/");

    await page.screenshot({
      path: `${SNAPSHOTS}/home-390x844.png`,
      fullPage: true,
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
