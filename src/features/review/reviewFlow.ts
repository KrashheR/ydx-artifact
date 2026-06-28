import type { GameReviewGateway } from "@/services/platform/mockPlatform";
import type { ReviewUnavailableReason } from "@/entities/save/schema";

export type NativeReviewFlowResult =
  | { status: "sent" }
  | { status: "closed" }
  | { status: "unavailable"; reason?: ReviewUnavailableReason }
  | { status: "error"; error: unknown };

export async function runNativeReviewFlow(
  gateway: GameReviewGateway
): Promise<NativeReviewFlowResult> {
  try {
    const availability = await gateway.canReview();

    if (!availability.value) {
      return {
        status: "unavailable",
        reason: availability.reason
      };
    }

    const result = await gateway.requestReview();

    return result.feedbackSent
      ? { status: "sent" }
      : { status: "closed" };
  } catch (error) {
    return { status: "error", error };
  }
}
