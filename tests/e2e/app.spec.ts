import { expect, test } from "@playwright/test";

test("home opens and starts gameplay", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Архив аномалий|Anomaly Archive/ })).toBeVisible();
  await page.getByRole("button", { name: /Начать|Start|Продолжить|Continue/ }).click();
  await expect(page.getByText(/Найдено|Found/)).toBeVisible();
});
