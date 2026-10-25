import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

const LATEST = "rpt_mock_9f3a1b";
const SOLVED = "rpt_mock_e4f6a2";

const detailRegion = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Detalle del reporte" });

test.describe("map-first selection", () => {
  test("every published report gets a pin and pins carry status labels", async ({
    page,
  }) => {
    await gotoHydrated(page, "/?periodo=30d");

    const pins = page.locator("[data-report-pin]");
    // Markers attach after the MapLibre canvas loads — wait for the first
    // before counting, otherwise the assertion races hydration.
    await expect(pins.first()).toBeAttached();
    const count = await pins.count();
    expect(count).toBeGreaterThanOrEqual(12);

    // Status-derived accessible names on every pin.
    await expect(
      page.getByRole("button", { name: new RegExp(`${SOLVED}.*Resuelto`) }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(`${LATEST}.*Abierto`) }),
    ).toBeVisible();
  });

  test("selecting a pin updates the panel and the URL in place", async ({
    page,
  }) => {
    // Pin the start on a known fixture — the shared e2e store accumulates
    // reports created by earlier specs, so fixture order is not position 1.
    await gotoHydrated(page, `/?reporte=${LATEST}&periodo=30d`);
    const detail = detailRegion(page);
    await expect(detail).toContainText("Agua acumulada sobre la calzada");

    await page
      .getByRole("button", { name: new RegExp(SOLVED) })
      .first()
      .click();

    await expect(detail).toContainText("Bache profundo en la mano derecha");
    await expect(detail).toContainText("Resuelto");
    await expect(detail).toContainText("Rellenar y compactar el bache");
    await expect(page).toHaveURL(new RegExp(`reporte=${SOLVED}`));
    // No navigation: the filters in the URL are preserved by replaceState.
    await expect(page).toHaveURL(/periodo=30d/);
  });

  test("prev/next navigates the dataset without wrapping", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");
    const detail = detailRegion(page);
    await expect(detail).toContainText("Reporte 1 de");

    const prev = page.getByRole("button", { name: "Reporte anterior" });
    const next = page.getByRole("button", { name: "Reporte siguiente" });
    await expect(prev).toBeDisabled();

    // Whatever sits at index 1, next must move exactly one step — the shared
    // e2e store grows between specs, so assert the counter, not the fixture.
    await next.click();
    await expect(detail).toContainText("Reporte 2 de");
    await expect(prev).toBeEnabled();
    await expect(page).toHaveURL(/reporte=rpt_/);

    await prev.click();
    await expect(detail).toContainText("Reporte 1 de");
  });

  test("keyboard activates a pin and moves the selection", async ({
    page,
  }) => {
    await gotoHydrated(page, `/?reporte=${LATEST}&periodo=30d`);
    const detail = detailRegion(page);
    await expect(detail).toContainText("Agua acumulada sobre la calzada");

    const pin = page.getByRole("button", { name: new RegExp(SOLVED) }).first();
    await pin.focus();
    await pin.press("Enter");

    await expect(detail).toContainText("Bache profundo en la mano derecha");
    await expect(page).toHaveURL(new RegExp(`reporte=${SOLVED}`));
  });

  test("a committed horizontal swipe selects the next report", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHydrated(page, `/?reporte=${LATEST}`);
    const detail = detailRegion(page);
    await expect(detail).toContainText("Agua acumulada sobre la calzada");

    const stage = page.getByTestId("swipe-stage");
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();
    // The card is taller than the viewport: drag inside its visible top band
    // (title/chips row) — the box midpoint sits below the fold and receives
    // no pointer events.
    const y = box!.y + 96;
    const startX = box!.x + box!.width * 0.8;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX - 140, y, { steps: 6 });
    await page.mouse.up();

    // Created reports sort above the fixtures, so the swipe target keeps the
    // fixture's relative order: the next item after LATEST is its successor.
    await expect(detail).toContainText("Ingresó agua en una vivienda baja");
    await expect(detail).toContainText(/Reporte \d+ de/);
  });

  test("the panel shows solutions and accepts a pending contribution", async ({
    page,
  }) => {
    await gotoHydrated(page, `/?reporte=${LATEST}`);

    const detail = detailRegion(page);
    await expect(detail).toContainText("Soluciones vecinales");
    await expect(detail).toContainText("pendiente de revisión");
    await expect(detail).toContainText("Abierto");

    await detail
      .getByLabel("Tu solución")
      .fill("Limpiar el desagüe y revisar la pendiente de la calle.");
    await detail
      .getByRole("button", { name: "Enviar solución" })
      .click();

    // Scope to the solutions list: the filled textarea also matches a plain
    // text locator, and a second run of the suite may persist a duplicate.
    await expect(
      detail
        .getByRole("listitem")
        .filter({ hasText: /Limpiar el desagüe y revisar la pendiente/ })
        .first(),
    ).toBeVisible({ timeout: 5_000 });
    await expect(detail).toContainText("Abierto");
  });

  test("map ancestors stay free of transforms (iOS WebGL rule)", async ({
    page,
  }) => {
    await gotoHydrated(page, "/");

    const offenders = await page.evaluate(() => {
      const canvas = document.querySelector(
        "[data-maplibre-canvas], .maplibregl-canvas",
      );
      if (!canvas) return [] as string[];
      const bad: string[] = [];
      let node = canvas.parentElement;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (
          style.transform !== "none" ||
          style.filter !== "none" ||
          style.willChange === "transform"
        ) {
          bad.push(
            `${node.tagName}.${node.className.toString().slice(0, 60)}`,
          );
        }
        node = node.parentElement;
      }
      return bad;
    });
    // When WebGL is unavailable the fallback list renders instead — no canvas
    // exists and the rule is trivially satisfied.
    expect(offenders).toEqual([]);
  });
});
