import type { ReviewPromptState } from "@/entities/save/schema";

export interface ReviewPromptEligibilityInput {
  completedLevels: number;
  reviewState: ReviewPromptState;
  isCampaignMapActive: boolean;
  isDocumentVisible: boolean;
  hasBlockingOverlay: boolean;
  isAdActive: boolean;
  isPurchaseFlowActive: boolean;
  isTutorialActive: boolean;
  nativeRequestInFlight: boolean;
}

export function isReviewPrePromptLocallyEligible(
  input: ReviewPromptEligibilityInput
): boolean {
  const {
    completedLevels,
    reviewState,
    isCampaignMapActive,
    isDocumentVisible,
    hasBlockingOverlay,
    isAdActive,
    isPurchaseFlowActive,
    isTutorialActive,
    nativeRequestInFlight
  } = input;

  if (!isCampaignMapActive || !isDocumentVisible) return false;
  if (hasBlockingOverlay || isAdActive) return false;
  if (isPurchaseFlowActive || isTutorialActive) return false;
  if (reviewState.nativeReviewResolved) return false;
  if (nativeRequestInFlight) return false;
  if (reviewState.prePromptShownCount >= 2) return false;

  return completedLevels >= reviewState.nextEligibleCompletedLevel;
}

export function getNextReviewPromptStateAfterLater(
  reviewState: ReviewPromptState,
  completedLevels: number
): ReviewPromptState {
  if (reviewState.prePromptShownCount <= 1) {
    return {
      ...reviewState,
      nextEligibleCompletedLevel: Math.max(completedLevels + 5, 8)
    };
  }

  return reviewState;
}
