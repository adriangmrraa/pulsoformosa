import { expect, type Page } from "@playwright/test";

export async function waitHydrated(page: Page): Promise<void> {
  await expect(page.locator('html[data-hydrated="true"]')).toHaveCount(1, {
    timeout: 30_000,
  });
}

export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await waitHydrated(page);
}
