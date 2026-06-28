import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@/i18n";
import { GameReviewPrePromptModal } from "@/features/review/GameReviewPrePromptModal";

describe("GameReviewPrePromptModal", () => {
  it("renders localized texts and accessible close button", async () => {
    render(
      <GameReviewPrePromptModal
        isOpen
        isSubmitting={false}
        onReview={() => {}}
        onLater={() => {}}
        onClose={() => {}}
      />
    );

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByText("Как вам экспедиция?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("wires primary, secondary, and escape actions", async () => {
    const onReview = vi.fn();
    const onLater = vi.fn();
    const onClose = vi.fn();

    render(
      <GameReviewPrePromptModal
        isOpen
        isSubmitting={false}
        onReview={onReview}
        onLater={onLater}
        onClose={onClose}
      />
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "Оценить игру" })).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Оценить игру" }));
    fireEvent.click(screen.getByRole("button", { name: "Позже" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onLater).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables repeat actions while loading", async () => {
    const onReview = vi.fn();

    render(
      <GameReviewPrePromptModal
        isOpen
        isSubmitting
        onReview={onReview}
        onLater={() => {}}
        onClose={() => {}}
      />
    );

    const button = await screen.findByRole("button", { name: /Открываем/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onReview).not.toHaveBeenCalled();
  });

  it("traps focus and restores it on close", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <GameReviewPrePromptModal
        isOpen
        isSubmitting={false}
        onReview={() => {}}
        onLater={() => {}}
        onClose={() => {}}
      />
    );

    const reviewButton = await screen.findByRole("button", { name: "Оценить игру" });
    const laterButton = screen.getByRole("button", { name: "Позже" });

    expect(reviewButton).toHaveFocus();
    laterButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Закрыть" })).toHaveFocus();

    rerender(
      <GameReviewPrePromptModal
        isOpen={false}
        isSubmitting={false}
        onReview={() => {}}
        onLater={() => {}}
        onClose={() => {}}
      />
    );

    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });
});
