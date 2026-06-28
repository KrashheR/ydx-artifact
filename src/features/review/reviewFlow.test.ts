import { describe, expect, it, vi } from "vitest";
import { runNativeReviewFlow } from "@/features/review/reviewFlow";

describe("runNativeReviewFlow", () => {
  it("calls canReview before requestReview", async () => {
    const steps: string[] = [];
    const gateway = {
      canReview: vi.fn(async () => {
        steps.push("canReview");
        return { value: true as const };
      }),
      requestReview: vi.fn(async () => {
        steps.push("requestReview");
        return { feedbackSent: true };
      })
    };

    const result = await runNativeReviewFlow(gateway);

    expect(result).toEqual({ status: "sent" });
    expect(steps).toEqual(["canReview", "requestReview"]);
  });

  it("does not request a review when canReview returns false", async () => {
    const gateway = {
      canReview: vi.fn(async () => ({ value: false as const, reason: "NO_AUTH" as const })),
      requestReview: vi.fn()
    };

    const result = await runNativeReviewFlow(gateway);

    expect(result).toEqual({ status: "unavailable", reason: "NO_AUTH" });
    expect(gateway.requestReview).not.toHaveBeenCalled();
  });

  it("maps feedbackSent=true to sent and false to closed", async () => {
    const sentGateway = {
      canReview: vi.fn(async () => ({ value: true as const })),
      requestReview: vi.fn(async () => ({ feedbackSent: true }))
    };
    const closedGateway = {
      canReview: vi.fn(async () => ({ value: true as const })),
      requestReview: vi.fn(async () => ({ feedbackSent: false }))
    };

    await expect(runNativeReviewFlow(sentGateway)).resolves.toEqual({ status: "sent" });
    await expect(runNativeReviewFlow(closedGateway)).resolves.toEqual({ status: "closed" });
  });

  it("returns an error result instead of throwing", async () => {
    const gateway = {
      canReview: vi.fn(async () => ({ value: true as const })),
      requestReview: vi.fn(async () => {
        throw new Error("boom");
      })
    };

    const result = await runNativeReviewFlow(gateway);

    expect(result.status).toBe("error");
  });
});
