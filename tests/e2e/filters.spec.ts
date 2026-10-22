import { expect, test } from "@playwright/test";

test("the category filter narrows the list to matching fixtures", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Calles" }).click();
  await expect(page).toHaveURL(/categoria=calles/);

  const cards = page.locator("#lista-reportes article");
  await expect(cards.first()).toBeVisible();

  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    await expect(cards.nth(index)).toContainText("Calles y rutas");
  }
});

test("the period filter persists across reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "30 días" }).click();
  await expect(page).toHaveURL(/periodo=30d/);

  await page.reload();
  await expect(page).toHaveURL(/periodo=30d/);
  await expect(
    page.getByRole("radio", { name: "30 días" }),
  ).toHaveAttribute("aria-checked", "true");
});

test("the water category exposes the contextual subtype row", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Agua" }).click();
  await expect(
    page.getByRole("radiogroup", { name: "Subtipo de agua" }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "calle anegada" }),
  ).toBeVisible();
});
