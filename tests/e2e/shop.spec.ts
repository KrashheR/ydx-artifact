import { expect, test, type Page } from "@playwright/test";

const SAVE_KEY = "anomaly-archive-save-v1";

/**
 * Seeds a save with progress so the bootstrap lands on the Archive Hub instead
 * of the first-launch onboarding level.
 */
async function seedHubSave(page: Page, locale: "ru" | "en") {
  await page.addInitScript(
    ([key, lang]) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 3,
          updatedAt: Date.now(),
          completedLevels: ["nr-01-scene01"],
          bestResults: {},
          inProgress: null,
          levelAttemptCounts: { "nr-01-scene01": 1 },
          magnifiers: 4,
          artifacts: {},
          viewedCampaignReportIds: [],
          daily: { lastClaimDate: null, streak: 0, lastAdRewardDate: null },
          settings: {
            locale: lang,
            localeSource: "manual",
            vibration: true,
            reducedMotion: false,
            comparatorScheme: "flip",
          },
          reviewPrompt: {
            schemaVersion: 1,
            prePromptShownCount: 0,
            nextEligibleCompletedLevel: 4,
            nativeReviewResolved: false,
          },
          purchases: { noForcedInterstitials: false, productIds: [] },
        }),
      );
    },
    [SAVE_KEY, locale] as const,
  );
}

for (const locale of ["ru", "en"] as const) {
  test(`archive shop opens from the hub and fits the viewport (${locale})`, async ({
    page,
  }) => {
    await seedHubSave(page, locale);
    await page.goto("/");

    const shopButton = page.getByRole("button", {
      name: locale === "ru" ? "Магазин" : "Shop",
    });
    await expect(shopButton).toBeVisible();

    // Touch target must stay at least 44x44 on every viewport.
    const buttonBox = await shopButton.boundingBox();
    expect(buttonBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    await shopButton.click();

    const dialog = page.getByRole("dialog", {
      name: locale === "ru" ? "Архивная лавка" : "Archive Shop",
    });
    await expect(dialog).toBeVisible();

    // The production preview has no Yandex Payments API: the shop must say so
    // instead of rendering an empty shelf.
    await expect(
      dialog.getByText(
        locale === "ru"
          ? "Платежи сейчас недоступны"
          : "Payments are unavailable right now",
      ),
    ).toBeVisible();

    // The dialog itself never forces the page into horizontal scroll.
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);

    const dialogBox = await dialog.boundingBox();
    const viewport = page.viewportSize();
    expect(dialogBox?.width ?? 0).toBeLessThanOrEqual(viewport?.width ?? 0);
    expect(dialogBox?.height ?? 0).toBeLessThanOrEqual(viewport?.height ?? 0);

    await dialog
      .getByRole("button", { name: locale === "ru" ? "Закрыть" : "Close" })
      .click();
    await expect(dialog).toBeHidden();
  });
}
