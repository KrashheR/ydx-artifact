import { expect, test } from "@playwright/test";

test("home opens and starts gameplay", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Тайны экспедиций|Expedition Mysteries/ })).toBeVisible();
  await page.getByRole("button", { name: /Начать|Start|Продолжить|Continue/ }).click();
  await expect(page.getByText(/Найдено|Found/)).toBeVisible();
});
