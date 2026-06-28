# UI Change Flow

Use this for screen, layout, responsive, and component changes.

## Read

1. `docs/design-reference/CODEX_HANDOFF.md`
2. The touched screen/component and nearby tests
3. `src/i18n/ru/common.json` and `src/i18n/en/common.json` for visible copy
4. `docs/design-reference/tokens.json` only when choosing new token values

## Implement

1. Keep visible strings in locale JSON, not component literals.
2. Prefer existing shared UI patterns in `src/shared/ui/`.
3. Split large JSX only when the new component has a clear local responsibility.
4. Preserve 44px touch targets, visible focus states, and RU/EN text fit.
5. Use `VITE_LAYOUT_DEBUG=true pnpm dev` only for visual hitbox alignment.

## Check

- Run `pnpm lint` and `pnpm typecheck`.
- Add focused Vitest/component coverage when logic or accessibility behavior changes.
- Use Playwright only for risky navigation/responsive regressions or release checks.
