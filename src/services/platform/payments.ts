import {
  getYandexSdk,
  type YandexCatalogProduct,
  type YandexPaymentsApi,
  type YandexPurchase,
} from "@/services/platform/mockPlatform";

/** Product ids that must exist in the Yandex Developer Console. */
export const SHOP_PRODUCT_IDS = [
  "no_forced_ads",
  "magnifiers_10",
  "archive_starter_pack",
] as const;

export type ShopProductId = (typeof SHOP_PRODUCT_IDS)[number];

const shopProductIdSet = new Set<string>(SHOP_PRODUCT_IDS);

export function isShopProductId(value: string): value is ShopProductId {
  return shopProductIdSet.has(value);
}

export type ShopProductReward = {
  /** Magnifiers added to the balance on a successful grant. */
  magnifiers: number;
  /** Grants the permanent `noForcedInterstitials` entitlement. */
  noForcedInterstitials: boolean;
  /** Consumables are consumed after the reward is durably saved. */
  consumable: boolean;
  /** One-time payloads are granted at most once, however often they recover. */
  oneTime: boolean;
};

export const SHOP_PRODUCT_REWARDS: Record<ShopProductId, ShopProductReward> = {
  no_forced_ads: {
    magnifiers: 0,
    noForcedInterstitials: true,
    consumable: false,
    oneTime: true,
  },
  magnifiers_10: {
    magnifiers: 10,
    noForcedInterstitials: false,
    consumable: true,
    oneTime: false,
  },
  archive_starter_pack: {
    magnifiers: 20,
    noForcedInterstitials: true,
    consumable: false,
    oneTime: true,
  },
};

/** Catalog entry normalized away from the raw SDK shape. */
export type ShopCatalogProduct = {
  id: ShopProductId;
  /** Console-provided title; the UI prefers its localized string. */
  catalogTitle?: string;
  catalogDescription?: string;
  imageUrl?: string;
  /** Formatted price including the currency marker, straight from the catalog. */
  price?: string;
  priceValue?: string;
  priceCurrencyCode?: string;
  priceCurrencyImageUrl?: string;
};

export type ShopPurchaseRecord = {
  productId: ShopProductId;
  purchaseToken: string;
};

export type PaymentsErrorKind = "cancelled" | "unavailable" | "failed";

export class PaymentsError extends Error {
  readonly kind: PaymentsErrorKind;

  constructor(kind: PaymentsErrorKind, message: string) {
    super(message);
    this.name = "PaymentsError";
    this.kind = kind;
  }
}

export interface PaymentsGateway {
  isAvailable(): Promise<boolean>;
  getCatalog(): Promise<ShopCatalogProduct[]>;
  purchase(productId: ShopProductId): Promise<ShopPurchaseRecord>;
  getPurchases(): Promise<ShopPurchaseRecord[]>;
  consumePurchase(purchaseToken: string): Promise<void>;
}

function categorizePaymentsError(error: unknown): PaymentsErrorKind {
  if (error instanceof PaymentsError) return error.kind;
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : "";
  if (/cancel|closed|dismiss|отмен|закры/i.test(message)) return "cancelled";
  if (/unavailable|not\s*supported|no\s*payments|недоступ/i.test(message)) {
    return "unavailable";
  }
  return "failed";
}

export function toPaymentsError(error: unknown): PaymentsError {
  if (error instanceof PaymentsError) return error;
  const message = error instanceof Error ? error.message : String(error ?? "");
  return new PaymentsError(categorizePaymentsError(error), message);
}

function normalizeCatalogProduct(
  product: YandexCatalogProduct,
): ShopCatalogProduct | null {
  const id = product.id;
  if (!id || !isShopProductId(id)) return null;

  let priceCurrencyImageUrl: string | undefined;
  try {
    priceCurrencyImageUrl = product.getPriceCurrencyImage?.("medium");
  } catch {
    priceCurrencyImageUrl = undefined;
  }

  return {
    id,
    catalogTitle: product.title,
    catalogDescription: product.description,
    imageUrl: product.imageURI,
    price: product.price,
    priceValue: product.priceValue,
    priceCurrencyCode: product.priceCurrencyCode,
    priceCurrencyImageUrl,
  };
}

function normalizePurchase(
  purchase: YandexPurchase,
): ShopPurchaseRecord | null {
  const productId = purchase.productID;
  const purchaseToken = purchase.purchaseToken;
  if (!productId || !isShopProductId(productId)) return null;
  if (!purchaseToken) return null;
  return { productId, purchaseToken };
}

let paymentsApiPromise: Promise<YandexPaymentsApi | null> | null = null;

/**
 * Caches only a *successful* handle. A transient failure (SDK not ready yet,
 * auth hiccup for an anonymous player, network blip) must not pin the shop to
 * "unavailable" for the rest of the session, so a null result clears the cache
 * and the next call retries.
 */
async function getYandexPayments(): Promise<YandexPaymentsApi | null> {
  paymentsApiPromise ??= (async () => {
    try {
      const ysdk = await getYandexSdk();
      if (!ysdk?.getPayments) return null;
      return await ysdk.getPayments({ signed: false });
    } catch (error) {
      console.error("[platform:getPayments]", error);
      return null;
    }
  })();

  const payments = await paymentsApiPromise;
  if (!payments) {
    paymentsApiPromise = null;
  }
  return payments;
}

const yandexPaymentsGateway: PaymentsGateway = {
  async isAvailable() {
    const payments = await getYandexPayments();
    return Boolean(payments?.getCatalog);
  },
  async getCatalog() {
    const payments = await getYandexPayments();
    if (!payments?.getCatalog) {
      throw new PaymentsError("unavailable", "Payments API is unavailable");
    }
    try {
      const catalog = await payments.getCatalog();
      return catalog
        .map(normalizeCatalogProduct)
        .filter((product): product is ShopCatalogProduct => product !== null);
    } catch (error) {
      throw toPaymentsError(error);
    }
  },
  async purchase(productId) {
    const payments = await getYandexPayments();
    if (!payments?.purchase) {
      throw new PaymentsError("unavailable", "Payments API is unavailable");
    }
    let purchase: YandexPurchase;
    try {
      purchase = await payments.purchase({ id: productId });
    } catch (error) {
      throw toPaymentsError(error);
    }
    const record = normalizePurchase(purchase);
    if (!record || record.productId !== productId) {
      throw new PaymentsError(
        "failed",
        "Purchase response did not match the requested product",
      );
    }
    return record;
  },
  async getPurchases() {
    const payments = await getYandexPayments();
    if (!payments?.getPurchases) return [];
    try {
      const purchases = await payments.getPurchases();
      return purchases
        .map(normalizePurchase)
        .filter((record): record is ShopPurchaseRecord => record !== null);
    } catch (error) {
      throw toPaymentsError(error);
    }
  },
  async consumePurchase(purchaseToken) {
    const payments = await getYandexPayments();
    if (!payments?.consumePurchase) {
      throw new PaymentsError("unavailable", "Payments API is unavailable");
    }
    try {
      await payments.consumePurchase(purchaseToken);
    } catch (error) {
      throw toPaymentsError(error);
    }
  },
};

let paymentsGatewayOverride: PaymentsGateway | null = null;

/** Test/dev seam mirroring the ad gateway overrides. */
export function setPaymentsGatewayOverride(gateway: PaymentsGateway | null) {
  paymentsGatewayOverride = gateway;
}

export function getPaymentsGateway(): PaymentsGateway {
  return paymentsGatewayOverride ?? yandexPaymentsGateway;
}
