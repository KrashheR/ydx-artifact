import { expect, test } from "@playwright/test";

test("first launch opens level 1 onboarding and starts gameplay", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Пристань Борея|Boreas Pier/ })).toBeVisible();
  await page.getByRole("button", { name: /Начать расследование|Start investigation/ }).click();
  await expect(page.locator(".game-screen")).toBeVisible();
  await expect(
    page.locator(".game-hud").getByRole("button", { name: /Настройки|Settings/ })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Пауза|Pause/ })).toHaveCount(0);
});
