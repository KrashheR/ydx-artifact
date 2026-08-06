import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useTranslation } from "react-i18next";
import { trackAnalyticsEvent } from "@/services/analytics/analytics";
import {
  SHOP_PRODUCT_IDS,
  SHOP_PRODUCT_REWARDS,
  toPaymentsError,
  type ShopCatalogProduct,
  type ShopProductId,
} from "@/services/platform/payments";
import {
  loadShopCatalog,
  purchaseProduct,
} from "@/services/platform/purchaseService";
import { useGameStore } from "@/shared/store/gameStore";

type CatalogState =
  | { status: "loading" }
  | { status: "ready"; products: ShopCatalogProduct[] }
  | { status: "unavailable" }
  | { status: "error" };

type PurchaseState =
  | { status: "idle" }
  | { status: "purchasing"; productId: ShopProductId }
  | { status: "success"; productId: ShopProductId }
  | { status: "error"; productId: ShopProductId }
  | { status: "cancelled"; productId: ShopProductId };

function MagnifierIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

function NoAdsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M4 4.5 20 19.5" />
    </svg>
  );
}

function ArchiveBoxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h6l2 2h8v10H4Z" />
      <path d="M9 13h6" />
    </svg>
  );
}

const PRODUCT_ICONS: Record<
  ShopProductId,
  (props: { size?: number }) => ReactElement
> = {
  no_forced_ads: NoAdsIcon,
  magnifiers_10: MagnifierIcon,
  archive_starter_pack: ArchiveBoxIcon,
};

export function ShopModal({
  source,
  onClose,
}: {
  source: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const magnifiers = useGameStore((state) => state.saveData.magnifiers);
  const purchases = useGameStore((state) => state.saveData.purchases);

  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [purchase, setPurchase] = useState<PurchaseState>({ status: "idle" });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchCatalog = useCallback(async () => {
    setCatalog({ status: "loading" });
    try {
      const products = await loadShopCatalog();
      if (!mountedRef.current) return;
      setCatalog({ status: "ready", products });
    } catch (error) {
      if (!mountedRef.current) return;
      setCatalog(
        toPaymentsError(error).kind === "unavailable"
          ? { status: "unavailable" }
          : { status: "error" },
      );
    }
  }, []);

  useEffect(() => {
    trackAnalyticsEvent("shop_opened", { source, magnifiers });
    void fetchCatalog();
    // Opening is a one-shot event; the balance is only a snapshot for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCatalog, source]);

  function handleClose() {
    if (purchase.status === "purchasing") return;
    trackAnalyticsEvent("shop_closed", { source, magnifiers });
    onClose();
  }

  function isOwned(productId: ShopProductId) {
    if (!SHOP_PRODUCT_REWARDS[productId].oneTime) return false;
    if (purchases.grantedOneTimeProductIds.includes(productId)) return true;
    if (purchases.productIds.includes(productId)) return true;
    // The starter pack also carries the no-forced-ads entitlement, so buying it
    // must show the standalone product as already owned.
    return (
      productId === "no_forced_ads" && purchases.noForcedInterstitials === true
    );
  }

  async function handleBuy(product: ShopCatalogProduct) {
    // The in-flight guard lives in the purchase service too; this keeps the
    // second click from even reaching it during a React rerender.
    if (purchase.status === "purchasing") return;
    if (isOwned(product.id)) return;

    setPurchase({ status: "purchasing", productId: product.id });
    const outcome = await purchaseProduct(product.id, {
      priceValue: product.priceValue,
      priceCurrencyCode: product.priceCurrencyCode,
    });
    if (!mountedRef.current) return;

    if (outcome.status === "granted" || outcome.status === "already_owned") {
      setPurchase({ status: "success", productId: product.id });
      return;
    }
    setPurchase({
      status: outcome.status === "cancelled" ? "cancelled" : "error",
      productId: product.id,
    });
  }

  const visibleProducts =
    catalog.status === "ready"
      ? SHOP_PRODUCT_IDS.map((productId) =>
          catalog.products.find((product) => product.id === productId),
        )
          .filter((product): product is ShopCatalogProduct => Boolean(product))
          // Hiding the pack once no_forced_ads is owned keeps the player from
          // paying a second time for an advantage they already have.
          .filter(
            (product) =>
              product.id !== "archive_starter_pack" ||
              !isOwned("no_forced_ads"),
          )
      : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{
          background:
            "radial-gradient(80% 80% at 50% 42%, rgba(13,18,15,.6), rgba(13,18,15,.92))",
        }}
        aria-label={t("shop.close")}
        onClick={handleClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-modal-title"
        className="modal-panel relative z-10 flex max-h-[calc(100dvh-24px)] w-[620px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[18px] font-manrope"
        style={{
          background: "linear-gradient(180deg, #27302b, #1c241e)",
          border: "1px solid rgba(184,138,69,.35)",
          boxShadow:
            "0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(213,195,154,.08)",
          animation: "game-pop .5s cubic-bezier(.2,.8,.3,1.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, transparent, #d8af63, transparent)",
          }}
        />

        <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-3 pt-6 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.26em] text-exp-brass">
              {t("shop.eyebrow")}
            </p>
            <h2
              id="shop-modal-title"
              className="mt-1 font-cormorant text-[30px] font-semibold leading-none text-exp-parch sm:text-[36px]"
            >
              {t("shop.title")}
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-[1.45] text-exp-muted">
              {t("shop.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={purchase.status === "purchasing"}
            aria-label={t("shop.close")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-exp-parch transition hover:bg-white/5 active:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass disabled:opacity-45"
            style={{
              border: "1px solid rgba(213,195,154,.14)",
              background: "rgba(213,195,154,.05)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="shrink-0 px-5 sm:px-7">
          <div
            className="flex items-center gap-2 rounded-[10px] border border-exp-brass/[.35] px-3 py-2.5 text-exp-brass2"
            style={{ background: "rgba(184,138,69,.08)" }}
          >
            <MagnifierIcon size={17} />
            <span className="text-[11.5px] font-semibold uppercase tracking-[.14em] text-exp-muted">
              {t("shop.balance")}
            </span>
            <span className="ml-auto font-jetbrains text-[15px] font-bold">
              {magnifiers}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7">
          {catalog.status === "loading" && (
            <p className="py-8 text-center text-[13.5px] font-semibold text-exp-muted">
              {t("shop.loading")}
            </p>
          )}

          {(catalog.status === "unavailable" || catalog.status === "error") && (
            <div className="py-6 text-center">
              <p className="text-[15px] font-bold text-exp-parch">
                {catalog.status === "unavailable"
                  ? t("shop.unavailable")
                  : t("shop.catalogError")}
              </p>
              {catalog.status === "unavailable" && (
                <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-[1.5] text-exp-muted">
                  {t("shop.unavailableBody")}
                </p>
              )}
              {/* Payments can come back mid-session (late SDK, auth), so even
                  the unavailable state stays retryable rather than terminal. */}
              <button
                type="button"
                onClick={() => void fetchCatalog()}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-exp-brass/[.4] px-6 text-[13.5px] font-semibold text-exp-brass2 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass"
                style={{ background: "rgba(184,138,69,.08)" }}
              >
                {t("shop.retry")}
              </button>
            </div>
          )}

          {catalog.status === "ready" && (
            <ul className="flex flex-col gap-3">
              {visibleProducts.map((product) => {
                const owned = isOwned(product.id);
                const Icon = PRODUCT_ICONS[product.id];
                const isBusy =
                  purchase.status === "purchasing" &&
                  purchase.productId === product.id;
                const statusForProduct =
                  purchase.status !== "idle" &&
                  purchase.status !== "purchasing" &&
                  purchase.productId === product.id
                    ? purchase.status
                    : null;

                return (
                  <li
                    key={product.id}
                    className="relative flex flex-col gap-3 rounded-[12px] border px-4 py-4 sm:flex-row sm:items-center"
                    style={{
                      background: "rgba(21,27,24,.5)",
                      borderColor:
                        product.id === "archive_starter_pack"
                          ? "rgba(216,175,99,.5)"
                          : "rgba(213,195,154,.12)",
                    }}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-exp-brass2"
                      style={{
                        border: "1px solid rgba(184,138,69,.35)",
                        background: "rgba(184,138,69,.1)",
                      }}
                      aria-hidden="true"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-full w-full rounded-[9px] object-cover"
                          draggable={false}
                        />
                      ) : (
                        <Icon size={20} />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-bold leading-[1.25] text-exp-parch">
                          {t(`shop.products.${product.id}.title`)}
                        </h3>
                        {product.id === "archive_starter_pack" && (
                          <span className="inline-flex h-[20px] items-center rounded-[5px] border border-exp-brass/[.45] bg-exp-brass/[.16] px-2 text-[9px] font-bold uppercase tracking-[.1em] text-exp-brass2">
                            {t("shop.bestValue")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12.5px] leading-[1.45] text-exp-muted">
                        {t(`shop.products.${product.id}.description`)}
                      </p>
                      {statusForProduct === "success" && (
                        <p className="mt-1.5 text-[12px] font-bold text-exp-success">
                          {t("shop.success")}
                        </p>
                      )}
                      {statusForProduct === "error" && (
                        <p
                          className="mt-1.5 text-[12px] font-bold"
                          style={{ color: "#e08a78" }}
                        >
                          {t("shop.error")}
                        </p>
                      )}
                      {statusForProduct === "cancelled" && (
                        <p className="mt-1.5 text-[12px] font-semibold text-exp-muted">
                          {t("shop.cancelled")}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <span className="font-jetbrains text-[13px] font-bold text-exp-brass2">
                        {/* Price, currency label and icon come from the catalog. */}
                        {product.price ??
                          (product.priceValue && product.priceCurrencyCode
                            ? `${product.priceValue} ${product.priceCurrencyCode}`
                            : t("shop.priceUnavailable"))}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleBuy(product)}
                        disabled={
                          owned || purchase.status === "purchasing" || !product.price
                        }
                        className="inline-flex min-h-[44px] min-w-[112px] items-center justify-center rounded-[10px] border-none px-4 text-center text-[13px] font-bold leading-[1.2] text-[#1a130a] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-brass disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          background:
                            "linear-gradient(180deg, #d8af63, #b3812f)",
                          boxShadow:
                            "0 8px 18px rgba(184,138,69,.25), inset 0 1px 0 rgba(255,255,255,.3)",
                        }}
                      >
                        {owned
                          ? t("shop.owned")
                          : isBusy
                            ? t("shop.purchasing")
                            : statusForProduct === "error"
                              ? t("shop.retry")
                              : t("shop.buy")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
