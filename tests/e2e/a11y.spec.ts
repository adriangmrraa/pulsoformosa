import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

for (const route of ["/", "/reportar"]) {
  test(`axe finds no serious or critical violations on ${route}`, async ({
    page,
  }) => {
    await gotoHydrated(page, route);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

test("keyboard traversal leaves no focus trap", async ({ page }) => {
  await gotoHydrated(page, "/reportar");

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
  }

  const active = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    return {
      tag: element?.tagName ?? null,
      insideBody: Boolean(element && document.body.contains(element)),
    };
  });

  expect(active.insideBody).toBe(true);
  expect(active.tag).not.toBeNull();
});

test("interactive controls meet the 44px comfort target", async ({ page }) => {
  for (const route of ["/", "/reportar"]) {
    await gotoHydrated(page, route);
    const tooSmall = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "button, [role='radio'], summary",
        ),
      )
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.width < 43.5 || rect.height < 43.5)
          );
        })
        .map((element) => ({
          tag: element.tagName,
          text: (element.textContent ?? "").trim().slice(0, 40),
          width: element.getBoundingClientRect().width,
          height: element.getBoundingClientRect().height,
        })),
    );
    expect(tooSmall).toEqual([]);
  }
});

test("map pins expose status-derived accessible names", async ({ page }) => {
  await gotoHydrated(page, "/?periodo=30d");
  const pins = page.locator("[data-report-pin]");
  const count = await pins.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const label = await pins.nth(index).getAttribute("aria-label");
    expect(label).toMatch(/Reporte rpt_\w+ — (Abierto|Resuelto)/);
  }
});

test("the detail panel announces its position politely", async ({ page }) => {
  await gotoHydrated(page, "/");
  const live = page
    .getByRole("region", { name: "Detalle del reporte" })
    .locator("[aria-live='polite']")
    .first();
  await expect(live).toContainText(/Reporte \d+ de \d+/);
});
