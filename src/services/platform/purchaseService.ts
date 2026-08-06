import {
  PROCESSED_PURCHASE_TOKEN_LIMIT,
  type SaveData,
} from "@/entities/save/schema";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import {
  getPaymentsGateway,
  isShopProductId,
  SHOP_PRODUCT_REWARDS,
  toPaymentsError,
  type PaymentsErrorKind,
  type ShopCatalogProduct,
  type ShopProductId,
  type ShopPurchaseRecord,
} from "@/services/platform/payments";
import { useGameStore } from "@/shared/store/gameStore";

export type PurchaseSource = "shop" | "startup_recovery";

export type PurchaseOutcome =
  | { status: "granted"; productId: ShopProductId; magnifiersAfter: number }
  | { status: "already_owned"; productId: ShopProductId }
  | { status: "cancelled"; productId: ShopProductId }
  | {
      status: "failed";
      productId: ShopProductId;
      errorKind: PaymentsErrorKind | "not_persisted";
    };

/**
 * Guards the whole purchase pipeline. A second click while a purchase is in
 * flight is dropped rather than opening a second Yandex payment window.
 */
let purchaseInFlight = false;

export function isPurchaseInFlight() {
  return purchaseInFlight;
}

function trimTokenLedger(tokens: string[]) {
  return tokens.length <= PROCESSED_PURCHASE_TOKEN_LIMIT
    ? tokens
    : tokens.slice(tokens.length - PROCESSED_PURCHASE_TOKEN_LIMIT);
}

type GrantPlan = {
  /** Reward payload still owed to the player. */
  shouldGrantReward: boolean;
  /** Entitlement rows that need to be (re)asserted. */
  needsSaveWrite: boolean;
};

function planGrant(saveData: SaveData, record: ShopPurchaseRecord): GrantPlan {
  const reward = SHOP_PRODUCT_REWARDS[record.productId];
  const purchases = saveData.purchases;
  const tokenProcessed = purchases.processedPurchaseTokens.includes(
    record.purchaseToken,
  );
  const oneTimeGranted =
    reward.oneTime &&
    purchases.grantedOneTimeProductIds.includes(record.productId);

  const shouldGrantReward = !tokenProcessed && !oneTimeGranted;
  const entitlementMissing =
    (reward.noForcedInterstitials && !purchases.noForcedInterstitials) ||
    !purchases.productIds.includes(record.productId) ||
    !tokenProcessed;

  return { shouldGrantReward, needsSaveWrite: shouldGrantReward || entitlementMissing };
}

function applyGrant(saveData: SaveData, record: ShopPurchaseRecord): SaveData {
  const reward = SHOP_PRODUCT_REWARDS[record.productId];
  const plan = planGrant(saveData, record);
  const purchases = saveData.purchases;

  return {
    ...saveData,
    magnifiers:
      saveData.magnifiers + (plan.shouldGrantReward ? reward.magnifiers : 0),
    purchases: {
      ...purchases,
      noForcedInterstitials:
        purchases.noForcedInterstitials || reward.noForcedInterstitials,
      productIds: purchases.productIds.includes(record.productId)
        ? purchases.productIds
        : [...purchases.productIds, record.productId],
      // Ledger entry lands in the SAME write as the reward, so a crash between
      // saving and consuming can never grant twice.
      processedPurchaseTokens: purchases.processedPurchaseTokens.includes(
        record.purchaseToken,
      )
        ? purchases.processedPurchaseTokens
        : trimTokenLedger([
            ...purchases.processedPurchaseTokens,
            record.purchaseToken,
          ]),
      grantedOneTimeProductIds:
        reward.oneTime &&
        !purchases.grantedOneTimeProductIds.includes(record.productId)
          ? [...purchases.grantedOneTimeProductIds, record.productId]
          : purchases.grantedOneTimeProductIds,
    },
  };
}

/**
 * Idempotently turns a platform purchase into save state, then consumes it.
 *
 * Order matters: grant + ledger + entitlement are written together and flushed
 * to the cloud; `consumePurchase` runs only once that write reported success.
 */
export async function redeemPurchase(
  record: ShopPurchaseRecord,
  source: PurchaseSource,
): Promise<PurchaseOutcome> {
  const store = useGameStore.getState();
  const reward = SHOP_PRODUCT_REWARDS[record.productId];
  const before = store.saveData;
  const plan = planGrant(before, record);
  const magnifiersBefore = before.magnifiers;

  if (plan.needsSaveWrite) {
    store.applySaveMutation((saveData) => applyGrant(saveData, record));
    const { persisted } = await useGameStore.getState().persistSave({
      flush: true,
    });

    if (!persisted) {
      // Leave the purchase unconsumed: startup recovery will retry it. The
      // in-memory grant stays so the current session is not penalised.
      trackAnalyticsEvent("purchase_failed", {
        productId: record.productId,
        source,
        resultType: "not_persisted",
      });
      return {
        status: "failed",
        productId: record.productId,
        errorKind: "not_persisted",
      };
    }

    if (plan.shouldGrantReward) {
      const magnifiersAfter = useGameStore.getState().saveData.magnifiers;
      trackAnalyticsEvent("purchase_reward_granted", {
        productId: record.productId,
        source,
        magnifiersBefore,
        magnifiersAfter,
        noForcedInterstitials: reward.noForcedInterstitials,
      });
    }
  } else {
    trackAnalyticsEvent("purchase_already_owned", {
      productId: record.productId,
      source,
    });
  }

  if (reward.consumable) {
    try {
      await getPaymentsGateway().consumePurchase(record.purchaseToken);
      trackAnalyticsEvent("purchase_consumed", {
        productId: record.productId,
        source,
      });
    } catch (error) {
      // Non-fatal: the ledger already blocks a second grant, and the next
      // startup recovery retries the consume.
      trackAnalyticsEvent("purchase_failed", {
        productId: record.productId,
        source,
        resultType: "consume_failed",
        errorKind: toPaymentsError(error).kind,
      });
    }
  }

  if (!plan.shouldGrantReward) {
    return { status: "already_owned", productId: record.productId };
  }

  return {
    status: "granted",
    productId: record.productId,
    magnifiersAfter: useGameStore.getState().saveData.magnifiers,
  };
}

export async function loadShopCatalog(): Promise<ShopCatalogProduct[]> {
  try {
    const catalog = await getPaymentsGateway().getCatalog();
    trackAnalyticsEvent("shop_catalog_loaded", {
      productCount: catalog.length,
      productIds: catalog.map((product) => product.id).join(","),
    });
    return catalog;
  } catch (error) {
    const paymentsError = toPaymentsError(error);
    trackAnalyticsEvent("shop_catalog_failed", {
      source: "shop",
      errorKind: paymentsError.kind,
    });
    throw paymentsError;
  }
}

export async function purchaseProduct(
  productId: ShopProductId,
  context: { priceValue?: string; priceCurrencyCode?: string } = {},
): Promise<PurchaseOutcome> {
  if (purchaseInFlight) {
    return { status: "cancelled", productId };
  }
  purchaseInFlight = true;

  trackAnalyticsEvent("purchase_requested", {
    productId,
    source: "shop",
    priceValue: context.priceValue,
    priceCurrencyCode: context.priceCurrencyCode,
    magnifiersBefore: useGameStore.getState().saveData.magnifiers,
  });

  try {
    const record = await getPaymentsGateway().purchase(productId);

    if (record.productId !== productId || !record.purchaseToken) {
      trackAnalyticsEvent("purchase_failed", {
        productId,
        source: "shop",
        resultType: "invalid_receipt",
      });
      return { status: "failed", productId, errorKind: "failed" };
    }

    const outcome = await redeemPurchase(record, "shop");

    if (outcome.status === "granted" || outcome.status === "already_owned") {
      trackAnalyticsEvent("purchase_succeeded", {
        productId,
        source: "shop",
        priceValue: context.priceValue,
        priceCurrencyCode: context.priceCurrencyCode,
        resultType: outcome.status,
        magnifiersAfter: useGameStore.getState().saveData.magnifiers,
      });
    }

    return outcome;
  } catch (error) {
    const paymentsError = toPaymentsError(error);
    if (paymentsError.kind === "cancelled") {
      trackAnalyticsEvent("purchase_cancelled", { productId, source: "shop" });
      return { status: "cancelled", productId };
    }
    trackAnalyticsEvent("purchase_failed", {
      productId,
      source: "shop",
      resultType: "purchase_error",
      errorKind: paymentsError.kind,
    });
    return { status: "failed", productId, errorKind: paymentsError.kind };
  } finally {
    purchaseInFlight = false;
  }
}

/**
 * Startup reconciliation: restores non-consumable entitlements and finishes any
 * consumable that was paid for but never granted or never consumed.
 */
export async function recoverPurchases(): Promise<void> {
  let records: ShopPurchaseRecord[];
  try {
    records = await getPaymentsGateway().getPurchases();
  } catch {
    // Payments unavailable or unauthorized: the game must still start.
    return;
  }

  for (const record of records) {
    if (!isShopProductId(record.productId)) continue;
    const outcome = await redeemPurchase(record, "startup_recovery");
    trackAnalyticsEvent("purchase_recovered", {
      productId: record.productId,
      source: "startup_recovery",
      resultType: outcome.status,
      magnifiersAfter: useGameStore.getState().saveData.magnifiers,
    });
  }
}
