import { describe, expect, it } from "vitest";
import { initialReviewPromptState } from "@/entities/save/schema";
import {
  getNextReviewPromptStateAfterLater,
  isReviewPrePromptLocallyEligible
} from "@/features/review/reviewPrompt";

function makeEligibilityInput(overrides: Partial<Parameters<typeof isReviewPrePromptLocallyEligible>[0]> = {}) {
  return {
    completedLevels: 4,
    reviewState: initialReviewPromptState,
    isCampaignMapActive: true,
    isDocumentVisible: true,
    hasBlockingOverlay: false,
    isAdActive: false,
    isPurchaseFlowActive: false,
    isTutorialActive: false,
    nativeRequestInFlight: false,
    ...overrides
  };
}

describe("review prompt eligibility", () => {
  it("does not show before the fourth completed level", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ completedLevels: 3 }))).toBe(false);
  });

  it("becomes eligible after the fourth completed level", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ completedLevels: 4 }))).toBe(true);
  });

  it("keeps old saves with a level-three threshold from showing before level four", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({
      completedLevels: 3,
      reviewState: { ...initialReviewPromptState, nextEligibleCompletedLevel: 3 }
    }))).toBe(false);
  });

  it("can show from the post-level victory surface", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({
      isCampaignMapActive: false,
      isPostLevelVictoryActive: true
    }))).toBe(true);
  });

  it("does not show outside eligible surfaces", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ isCampaignMapActive: false }))).toBe(false);
  });

  it("does not show while an ad is active", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ isAdActive: true }))).toBe(false);
  });

  it("does not show while another blocking overlay is active", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ hasBlockingOverlay: true }))).toBe(false);
  });

  it("does not show during tutorial or purchase flow", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ isTutorialActive: true }))).toBe(false);
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ isPurchaseFlowActive: true }))).toBe(false);
  });

  it("does not show after two pre-prompt displays or after the native review flow resolved", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({
      reviewState: { ...initialReviewPromptState, prePromptShownCount: 2 }
    }))).toBe(false);

    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({
      reviewState: { ...initialReviewPromptState, nativeReviewResolved: true }
    }))).toBe(false);
  });

  it("schedules the next attempt no earlier than level eight after the first later action", () => {
    const nextState = getNextReviewPromptStateAfterLater(
      { ...initialReviewPromptState, prePromptShownCount: 1 },
      3
    );

    expect(nextState.nextEligibleCompletedLevel).toBe(8);
  });

  it("stops rescheduling after the second prompt has already been shown", () => {
    const nextState = getNextReviewPromptStateAfterLater(
      { ...initialReviewPromptState, prePromptShownCount: 2, nextEligibleCompletedLevel: 8 },
      8
    );

    expect(nextState.nextEligibleCompletedLevel).toBe(8);
  });
});
