import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18next from "i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@/i18n";
import { createDefaultSave } from "@/entities/save/schema";
import { ShopModal } from "@/features/shop/ShopModal";
import { createMockPaymentsGateway } from "@/services/platform/mockPayments";
import { setPaymentsGatewayOverride } from "@/services/platform/payments";
import { useGameStore } from "@/shared/store/gameStore";

vi.mock("@/services/storage/localSaveService", () => ({
  clearPersistentSave: vi.fn(async () => undefined),
  loadPersistentSave: vi.fn(async () => ({
    saveData: null,
    source: "default",
    cloudAvailable: false,
  })),
  savePersistentSave: vi.fn(async (saveData) => ({
    saveData,
    cloudSynced: true,
  })),
}));

describe("ShopModal", () => {
  beforeEach(() => {
    window.__artifactAnalyticsEvents = [];
    useGameStore.setState({
      screen: { kind: "home" },
      saveData: { ...createDefaultSave(), magnifiers: 3 },
      saveStatus: "idle",
    });
    setPaymentsGatewayOverride(createMockPaymentsGateway());
  });

  afterEach(async () => {
    setPaymentsGatewayOverride(null);
    await i18next.changeLanguage("ru");
  });

  it("renders the three catalog products with catalog prices", async () => {
    render(<ShopModal source="test" onClose={() => undefined} />);

    expect(
      await screen.findByText("Без принудительной рекламы"),
    ).toBeInTheDocument();
    expect(screen.getByText("10 луп")).toBeInTheDocument();
    expect(screen.getByText("Набор архивиста")).toBeInTheDocument();
    expect(screen.getByText("Лучший выбор")).toBeInTheDocument();
    // Prices are never hardcoded in the UI: they come from getCatalog().
    expect(screen.getAllByText(/YAN/)).toHaveLength(3);
  });

  it("shows the payments-unavailable state instead of an empty shelf", async () => {
    setPaymentsGatewayOverride(
      createMockPaymentsGateway({ behavior: "no_payments" }),
    );

    render(<ShopModal source="test" onClose={() => undefined} />);

    expect(
      await screen.findByText("Платежи сейчас недоступны"),
    ).toBeInTheDocument();
  });

  it("lets the player retry after payments were temporarily unavailable", async () => {
    const gateway = createMockPaymentsGateway({ behavior: "no_payments" });
    setPaymentsGatewayOverride(gateway);

    render(<ShopModal source="test" onClose={() => undefined} />);
    await screen.findByText("Платежи сейчас недоступны");

    // Payments can come back mid-session; the state must not be terminal.
    gateway.setBehavior("success");
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));

    expect(await screen.findByText("10 луп")).toBeInTheDocument();
  });

  it("confirms a successful purchase and updates the visible balance", async () => {
    render(<ShopModal source="test" onClose={() => undefined} />);
    await screen.findByText("10 луп");

    fireEvent.click(screen.getAllByRole("button", { name: "Купить" })[1]);

    expect(await screen.findByText("Покупка выполнена")).toBeInTheDocument();
    await waitFor(() => {
      expect(useGameStore.getState().saveData.magnifiers).toBe(13);
    });
  });

  it("blocks a parallel second purchase while one is in flight", async () => {
    render(<ShopModal source="test" onClose={() => undefined} />);
    await screen.findByText("10 луп");

    const buyButtons = screen.getAllByRole("button", { name: "Купить" });
    fireEvent.click(buyButtons[1]);
    fireEvent.click(buyButtons[1]);
    fireEvent.click(buyButtons[0]);

    await waitFor(() => {
      expect(useGameStore.getState().saveData.magnifiers).toBe(13);
    });
    expect(useGameStore.getState().saveData.magnifiers).toBe(13);
  });

  it("marks no_forced_ads as owned and hides the pack once it is purchased", async () => {
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        purchases: {
          ...state.saveData.purchases,
          noForcedInterstitials: true,
          productIds: ["no_forced_ads"],
          grantedOneTimeProductIds: ["no_forced_ads"],
        },
      },
    }));

    render(<ShopModal source="test" onClose={() => undefined} />);

    expect(await screen.findByText("Уже приобретено")).toBeInTheDocument();
    expect(screen.queryByText("Набор архивиста")).not.toBeInTheDocument();
  });

  it("shows the starter pack entitlement as owned for no_forced_ads", async () => {
    useGameStore.setState((state) => ({
      saveData: {
        ...state.saveData,
        purchases: {
          ...state.saveData.purchases,
          noForcedInterstitials: true,
          productIds: ["archive_starter_pack"],
          grantedOneTimeProductIds: ["archive_starter_pack"],
        },
      },
    }));

    render(<ShopModal source="test" onClose={() => undefined} />);

    await screen.findByText("Без принудительной рекламы");
    expect(screen.getByText("Уже приобретено")).toBeInTheDocument();
  });

  it("renders every English string without clipping the button labels", async () => {
    await i18next.changeLanguage("en");

    render(<ShopModal source="test" onClose={() => undefined} />);

    expect(await screen.findByText("Archive Shop")).toBeInTheDocument();
    expect(screen.getByText("No forced ads")).toBeInTheDocument();
    expect(screen.getByText("10 magnifiers")).toBeInTheDocument();
    expect(screen.getByText("Best value")).toBeInTheDocument();
    for (const button of screen.getAllByRole("button", { name: "Buy" })) {
      // Touch target and wrapping: two lines are allowed, truncation is not.
      expect(button.className).toContain("min-h-[44px]");
      expect(button.className).not.toContain("truncate");
      expect(button.className).not.toContain("whitespace-nowrap");
    }
  });

  it("emits registered shop analytics events", async () => {
    const { unmount } = render(
      <ShopModal source="home_hub" onClose={() => undefined} />,
    );
    await screen.findByText("10 луп");
    fireEvent.click(screen.getAllByRole("button", { name: "Закрыть" })[1]);
    unmount();

    const events = window.__artifactAnalyticsEvents ?? [];
    for (const event of events) {
      expect(event.goal).toBe(`aa_${event.event}`);
    }
    expect(events.map((event) => event.event)).toEqual(
      expect.arrayContaining([
        "shop_opened",
        "shop_catalog_loaded",
        "shop_closed",
      ]),
    );
  });
});
