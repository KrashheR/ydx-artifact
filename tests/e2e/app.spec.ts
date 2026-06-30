import { expect, test } from "@playwright/test";

test("home opens and starts gameplay", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Выберите экспедицию|Choose Your Expedition/ })).toBeVisible();
  await page.getByRole("button", { name: /Начать|Start|Продолжить|Continue/ }).first().click();
  await page.getByRole("button", { name: /^(Уровень 1|Level 1) / }).click();
  await expect(page.getByRole("button", { name: /Пауза|Pause/ })).toBeVisible();
});
