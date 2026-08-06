import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultSave } from "@/entities/save/schema";
import { createMockPaymentsGateway } from "@/services/platform/mockPayments";
import { setPaymentsGatewayOverride } from "@/services/platform/payments";
import {
  purchaseProduct,
  recoverPurchases,
} from "@/services/platform/purchaseService";
import { useGameStore } from "@/shared/store/gameStore";

const savePersistentSave = vi.fn(async (saveData) => ({
  saveData,
  cloudSynced: true,
}));

vi.mock("@/services/storage/localSaveService", () => ({
  clearPersistentSave: vi.fn(async () => undefined),
  loadPersistentSave: vi.fn(async () => ({
    saveData: null,
    source: "default",
    cloudAvailable: false,
  })),
  savePersistentSave: (...args: unknown[]) =>
    (savePersistentSave as unknown as (...a: unknown[]) => unknown)(...args),
}));

function resetStore(magnifiers = 1) {
  window.sessionStorage.clear();
  window.__artifactAnalyticsEvents = [];
  useGameStore.setState({
    screen: { kind: "home" },
    saveData: { ...createDefaultSave(), magnifiers },
    saveStatus: "idle",
  });
}

describe("purchaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savePersistentSave.mockImplementation(async (saveData) => ({
      saveData,
      cloudSynced: true,
    }));
    resetStore(0);
  });

  it("grants ten magnifiers once and consumes the token afterwards", async () => {
    const gateway = createMockPaymentsGateway();
    setPaymentsGatewayOverride(gateway);

    const outcome = await purchaseProduct("magnifiers_10");

    expect(outcome.status).toBe("granted");
    expect(useGameStore.getState().saveData.magnifiers).toBe(10);
    expect(gateway.getConsumedTokens()).toHaveLength(1);
    expect(
      useGameStore.getState().saveData.purchases.processedPurchaseTokens,
    ).toHaveLength(1);
  });

  it("does not grant twice when the same token is reprocessed", async () => {
    const token = "mock-token-magnifiers_10-1";
    const gateway = createMockPaymentsGateway({
      initialPurchases: [{ productId: "magnifiers_10", purchaseToken: token }],
    });
    setPaymentsGatewayOverride(gateway);

    await recoverPurchases();
    expect(useGameStore.getState().saveData.magnifiers).toBe(10);

    // Simulate the platform still reporting the purchase (consume never landed).
    setPaymentsGatewayOverride(
      createMockPaymentsGateway({
        initialPurchases: [{ productId: "magnifiers_10", purchaseToken: token }],
      }),
    );
    await recoverPurchases();

    expect(useGameStore.getState().saveData.magnifiers).toBe(10);
  });

  it("does not consume a purchase whose reward failed to persist", async () => {
    const gateway = createMockPaymentsGateway();
    setPaymentsGatewayOverride(gateway);
    savePersistentSave.mockImplementation(async () => {
      throw new Error("storage unavailable");
    });

    const outcome = await purchaseProduct("magnifiers_10");

    expect(outcome).toMatchObject({ status: "failed", errorKind: "not_persisted" });
    expect(gateway.getConsumedTokens()).toEqual([]);
    expect(gateway.getOutstandingPurchases()).toHaveLength(1);
  });

  it("recovers an unconsumed consumable on the next startup", async () => {
    const gateway = createMockPaymentsGateway({
      initialPurchases: [
        { productId: "magnifiers_10", purchaseToken: "recovered-token" },
      ],
    });
    setPaymentsGatewayOverride(gateway);

    await recoverPurchases();

    expect(useGameStore.getState().saveData.magnifiers).toBe(10);
    expect(gateway.getConsumedTokens()).toEqual(["recovered-token"]);
  });

  it("restores the no_forced_ads entitlement on startup", async () => {
    setPaymentsGatewayOverride(
      createMockPaymentsGateway({
        initialPurchases: [
          { productId: "no_forced_ads", purchaseToken: "nfa-token" },
        ],
      }),
    );

    await recoverPurchases();

    const purchases = useGameStore.getState().saveData.purchases;
    expect(purchases.noForcedInterstitials).toBe(true);
    expect(purchases.productIds).toContain("no_forced_ads");
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("grants the starter pack bonus once and keeps restoring its entitlement", async () => {
    const purchase = {
      productId: "archive_starter_pack" as const,
      purchaseToken: "pack-token",
    };
    setPaymentsGatewayOverride(
      createMockPaymentsGateway({ initialPurchases: [purchase] }),
    );

    await recoverPurchases();
    expect(useGameStore.getState().saveData.magnifiers).toBe(20);
    expect(
      useGameStore.getState().saveData.purchases.noForcedInterstitials,
    ).toBe(true);

    // Non-consumables keep coming back from getPurchases() forever.
    await recoverPurchases();
    await recoverPurchases();

    expect(useGameStore.getState().saveData.magnifiers).toBe(20);
    expect(
      useGameStore.getState().saveData.purchases.noForcedInterstitials,
    ).toBe(true);
  });

  it("reports a cancelled purchase without touching the balance", async () => {
    const gateway = createMockPaymentsGateway({ behavior: "cancel" });
    setPaymentsGatewayOverride(gateway);

    const outcome = await purchaseProduct("magnifiers_10");

    expect(outcome.status).toBe("cancelled");
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("reports a failed purchase without touching the balance", async () => {
    setPaymentsGatewayOverride(createMockPaymentsGateway({ behavior: "error" }));

    const outcome = await purchaseProduct("magnifiers_10");

    expect(outcome.status).toBe("failed");
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("survives a missing Payments API at startup", async () => {
    setPaymentsGatewayOverride(
      createMockPaymentsGateway({ behavior: "no_payments" }),
    );

    await expect(recoverPurchases()).resolves.toBeUndefined();
    expect(useGameStore.getState().saveData.magnifiers).toBe(0);
  });

  it("collapses a parallel double click into a single purchase", async () => {
    const gateway = createMockPaymentsGateway();
    setPaymentsGatewayOverride(gateway);

    const [first, second] = await Promise.all([
      purchaseProduct("magnifiers_10"),
      purchaseProduct("magnifiers_10"),
    ]);

    const granted = [first, second].filter(
      (outcome) => outcome.status === "granted",
    );
    expect(granted).toHaveLength(1);
    expect(useGameStore.getState().saveData.magnifiers).toBe(10);
    expect(gateway.getConsumedTokens()).toHaveLength(1);
  });

  it("emits only registered analytics events", async () => {
    setPaymentsGatewayOverride(createMockPaymentsGateway());

    await purchaseProduct("magnifiers_10");

    const events = window.__artifactAnalyticsEvents ?? [];
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.goal).toBe(`aa_${event.event}`);
    }
    expect(events.map((event) => event.event)).toEqual(
      expect.arrayContaining([
        "purchase_requested",
        "purchase_reward_granted",
        "purchase_consumed",
        "purchase_succeeded",
      ]),
    );
  });
});
