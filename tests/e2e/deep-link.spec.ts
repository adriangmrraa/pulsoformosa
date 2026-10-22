import { expect, test } from "@playwright/test";
import { gotoHydrated, waitHydrated } from "./helpers";
import { FIXTURE_REPORT_IDS } from "../fixtures/reports.fixture";

test("deep link opens the detail sheet independently of active filters", async ({
  page,
}) => {
  await gotoHydrated(
    page,
    `/?reporte=${FIXTURE_REPORT_IDS[0]}&categoria=calles&periodo=30d`,
  );

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Agua acumulada sobre la calzada");
  await expect(dialog).toContainText("Reportado por un vecino — no verificado");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/reporte=/);
});

test("filter params apply from the URL and survive a reload", async ({ page }) => {
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

test("a card link roundtrips to the same shareable state", async ({ page }) => {
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
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/categoria=agua/);
});
