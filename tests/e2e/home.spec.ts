import { mkdirSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

const SNAPSHOTS = "test-results/snapshots";

test.beforeAll(() => {
  mkdirSync(SNAPSHOTS, { recursive: true });
});

test.describe("home", () => {
  test("leads with the map hero, then the detail panel, then the list", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Deep-link to a fixture: persistence specs run before this one under the
    // shared e2e store, so the newest seeded report is no longer index 1 —
    // the assertion below checks composition, not dataset order.
    await gotoHydrated(page, "/?reporte=rpt_mock_9f3a1b");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Esto se está reportando en Formosa",
    );

    const map = page.getByRole("region", { name: "Mapa de reportes" });
    const detail = page.getByRole("region", { name: "Detalle del reporte" });
    const list = page.getByRole("heading", { name: "Reportes recientes" });

    await expect(map).toBeVisible();
    await expect(detail).toBeVisible();
    await expect(list).toBeVisible();

    // Render order: map → panel → list → sources.
    const positions = await page.evaluate(() => {
      const el = (selector: string) =>
        document.querySelector(selector)?.getBoundingClientRect().top ?? 0;
      return {
        map: el('[aria-label="Mapa de reportes"]'),
        panel: el('[aria-label="Detalle del reporte"]'),
        list: el("#lista-reportes"),
        sources: el("#fuentes-title"),
      };
    });
    expect(positions.map).toBeLessThan(positions.panel);
    expect(positions.panel).toBeLessThan(positions.list);
    expect(positions.list).toBeLessThan(positions.sources);

    // The deep-linked fixture report renders in the detail panel.
    await expect(detail).toContainText("Agua acumulada sobre la calzada");
    await expect(detail).toContainText(/Reporte \d+ de/);

    await expect(
      page.getByText("Dato de prueba — mock de desarrollo").first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Fuentes y metodología" }),
    ).toBeVisible();

    // Climate content is gone from the home render.
    await expect(page.getByText(/ENSO|El Niño|Próximas lluvias/)).toHaveCount(
      0,
    );

    await page.screenshot({
      path: `${SNAPSHOTS}/home-1440x900.png`,
      fullPage: true,
      // CSS scale keeps the capture surface at 1x — deviceScaleFactor 2.6
      // turns a full-page shot into a ~40MP bitmap and the protocol call OOMs
      // under memory pressure (mobile-chromium flake).
      scale: "css",
    });
  });

  test("renders at 1280px and keeps its canonical", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoHydrated(page, "/");
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      /3100\/?$/,
    );
    await page.screenshot({
      path: `${SNAPSHOTS}/home-1280x900.png`,
      fullPage: true,
      // CSS scale keeps the capture surface at 1x — deviceScaleFactor 2.6
      // turns a full-page shot into a ~40MP bitmap and the protocol call OOMs
      // under memory pressure (mobile-chromium flake).
      scale: "css",
    });
  });

  test("renders at mobile width without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHydrated(page, "/");

    await page.screenshot({
      path: `${SNAPSHOTS}/home-390x844.png`,
      fullPage: true,
      // CSS scale keeps the capture surface at 1x — deviceScaleFactor 2.6
      // turns a full-page shot into a ~40MP bitmap and the protocol call OOMs
      // under memory pressure (mobile-chromium flake).
      scale: "css",
    });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
