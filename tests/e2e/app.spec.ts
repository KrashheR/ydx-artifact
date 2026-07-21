import { expect, test } from "@playwright/test";

test("first launch opens level 1 onboarding and starts gameplay", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Пристань Борея|Boreas Pier/ })).toBeVisible();
  await page.getByRole("button", { name: /Начать расследование|Start investigation/ }).click();

  if (testInfo.project.name === "mobile") {
    const controlSchemeDialog = page.getByRole("dialog", {
      name: /Как сравнивать снимки\?|How do you want to compare\?/,
    });
    await expect(controlSchemeDialog).toBeVisible();
    await controlSchemeDialog
      .getByRole("button", { name: /Продолжить с переключением|Continue with Flip/ })
      .click();
    await expect(controlSchemeDialog).toBeHidden();
  }

  await expect(page.locator(".game-screen")).toBeVisible();
  await expect(
    page.locator(".game-hud").getByRole("button", { name: /Настройки|Settings/ })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Пауза|Pause/ })).toHaveCount(0);
});
