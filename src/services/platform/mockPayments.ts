import {
  PaymentsError,
  SHOP_PRODUCT_IDS,
  SHOP_PRODUCT_REWARDS,
  type PaymentsGateway,
  type ShopCatalogProduct,
  type ShopProductId,
  type ShopPurchaseRecord,
} from "@/services/platform/payments";

/**
 * In-memory Payments implementation for local development and tests.
 *
 * Prices mirror the starting values that have to be configured by hand in the
 * Yandex Developer Console; nothing in the app hardcodes them for production.
 */
const MOCK_PRICE_VALUES: Record<ShopProductId, string> = {
  no_forced_ads: "99",
  magnifiers_10: "29",
  archive_starter_pack: "129",
};

const MOCK_TITLES: Record<ShopProductId, string> = {
  no_forced_ads: "No forced ads",
  magnifiers_10: "10 magnifiers",
  archive_starter_pack: "Archivist pack",
};

export type MockPaymentsBehavior = "success" | "cancel" | "error" | "no_payments";

export type MockPaymentsOptions = {
  behavior?: MockPaymentsBehavior;
  /** Purchases the platform already knows about, e.g. an unconsumed consumable. */
  initialPurchases?: ShopPurchaseRecord[];
};

export type MockPaymentsGateway = PaymentsGateway & {
  setBehavior(behavior: MockPaymentsBehavior): void;
  getConsumedTokens(): string[];
  getOutstandingPurchases(): ShopPurchaseRecord[];
};

export function createMockPaymentsGateway(
  options: MockPaymentsOptions = {},
): MockPaymentsGateway {
  let behavior: MockPaymentsBehavior = options.behavior ?? "success";
  let purchases: ShopPurchaseRecord[] = [...(options.initialPurchases ?? [])];
  const consumedTokens: string[] = [];
  let tokenCounter = 0;

  const catalog: ShopCatalogProduct[] = SHOP_PRODUCT_IDS.map((id) => ({
    id,
    catalogTitle: MOCK_TITLES[id],
    catalogDescription: MOCK_TITLES[id],
    price: `${MOCK_PRICE_VALUES[id]} YAN`,
    priceValue: MOCK_PRICE_VALUES[id],
    priceCurrencyCode: "YAN",
  }));

  function assertAvailable() {
    if (behavior === "no_payments") {
      throw new PaymentsError("unavailable", "Payments API is unavailable");
    }
  }

  return {
    setBehavior(next) {
      behavior = next;
    },
    getConsumedTokens() {
      return [...consumedTokens];
    },
    getOutstandingPurchases() {
      return [...purchases];
    },
    async isAvailable() {
      return behavior !== "no_payments";
    },
    async getCatalog() {
      assertAvailable();
      return catalog.map((product) => ({ ...product }));
    },
    async purchase(productId) {
      assertAvailable();
      if (behavior === "cancel") {
        throw new PaymentsError("cancelled", "Purchase was cancelled");
      }
      if (behavior === "error") {
        throw new PaymentsError("failed", "Purchase failed");
      }
      tokenCounter += 1;
      const record: ShopPurchaseRecord = {
        productId,
        purchaseToken: `mock-token-${productId}-${tokenCounter}`,
      };
      purchases = [...purchases, record];
      return record;
    },
    async getPurchases() {
      assertAvailable();
      return purchases.map((record) => ({ ...record }));
    },
    async consumePurchase(purchaseToken) {
      assertAvailable();
      const target = purchases.find(
        (record) => record.purchaseToken === purchaseToken,
      );
      if (target && !SHOP_PRODUCT_REWARDS[target.productId].consumable) {
        throw new PaymentsError(
          "failed",
          "Non-consumable purchases cannot be consumed",
        );
      }
      consumedTokens.push(purchaseToken);
      purchases = purchases.filter(
        (record) => record.purchaseToken !== purchaseToken,
      );
    },
  };
}
