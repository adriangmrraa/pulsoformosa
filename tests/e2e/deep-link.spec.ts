import { expect, test } from "@playwright/test";
import { gotoHydrated, waitHydrated } from "./helpers";
import { FIXTURE_REPORT_IDS } from "../fixtures/reports.fixture";

const LATEST = FIXTURE_REPORT_IDS[0]; // rpt_mock_9f3a1b
const SOLVED = "rpt_mock_e4f6a2";

test("deep link selects the report independently of active filters", async ({
  page,
}) => {
  await gotoHydrated(
    page,
    `/?reporte=${LATEST}&categoria=calles&periodo=30d`,
  );

  const detail = page.getByRole("region", { name: "Detalle del reporte" });
  await expect(detail).toBeVisible();
  await expect(detail).toContainText("Agua acumulada sobre la calzada");
  await expect(detail).toContainText(
    "Reportado por un vecino — no verificado",
  );
  // The selected pin carries the deep-linked id.
  await expect(
    page.locator(`[data-report-pin="${LATEST}"]`).first(),
  ).toBeVisible();
});

test("deep link unions a report outside the filtered dataset", async ({
  page,
}) => {
  // rpt_mock_e4f6a2 is ROADS; filtering by agua would normally exclude it.
  await gotoHydrated(page, `/?reporte=${SOLVED}&categoria=agua&periodo=7d`);

  const detail = page.getByRole("region", { name: "Detalle del reporte" });
  await expect(detail).toContainText("Bache profundo en la mano derecha");
  await expect(detail).toContainText("Resuelto");
});

test("filter params apply from the URL and survive a reload", async ({
  page,
}) => {
  await gotoHydrated(page, "/?categoria=calles&periodo=30d");

  await expect(
    page.getByRole("radio", { name: "Calles" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByRole("radio", { name: "30 días" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await waitHydrated(page);
  await expect(page).toHaveURL(/categoria=calles/);
  await expect(page).toHaveURL(/periodo=30d/);
});

test("a card link roundtrips to the same shareable state", async ({
  page,
}) => {
  await gotoHydrated(page, "/?categoria=agua&periodo=30d");

  const firstCardLink = page
    .locator("#lista-reportes a[href*='reporte=']")
    .first();
  await expect(firstCardLink).toBeVisible();
  const href = await firstCardLink.getAttribute("href");
  expect(href).toContain("categoria=agua");
  expect(href).toContain("periodo=30d");
  expect(href).toContain("reporte=");

  await gotoHydrated(page, href ?? "/");
  const detail = page.getByRole("region", { name: "Detalle del reporte" });
  await expect(detail).toBeVisible();
  await expect(page).toHaveURL(/categoria=agua/);
});
