import { describe, expect, it } from "vitest";
import { initialReviewPromptState } from "@/entities/save/schema";
import {
  getNextReviewPromptStateAfterLater,
  isReviewPrePromptLocallyEligible
} from "@/features/review/reviewPrompt";

function makeEligibilityInput(overrides: Partial<Parameters<typeof isReviewPrePromptLocallyEligible>[0]> = {}) {
  return {
    completedLevels: 3,
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
  it("does not show before the third completed level", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ completedLevels: 2 }))).toBe(false);
  });

  it("becomes eligible after the third completed level", () => {
    expect(isReviewPrePromptLocallyEligible(makeEligibilityInput({ completedLevels: 3 }))).toBe(true);
  });

  it("does not show outside the campaign map", () => {
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
