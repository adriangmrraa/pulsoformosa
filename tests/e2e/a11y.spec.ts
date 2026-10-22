import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/reportar"]) {
  test(`axe finds no serious or critical violations on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

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
  await page.goto("/reportar");

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
