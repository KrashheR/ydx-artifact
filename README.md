# Find the Differences: Anomaly Archive

Local vertical-slice scaffold based on `docs/`.

## Run

```bash
pnpm install
pnpm dev
```

Open the Vite URL printed by the command. The default platform mode is local mock and does not require Yandex SDK.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:content
pnpm build
pnpm test:e2e
```

## Scope Implemented

- React + TypeScript strict + Vite + Tailwind.
- RU/EN i18n with manual switch.
- Data-driven 12-level campaign and 3 daily entries.
- Local placeholder A/B scene assets, listed in `ASSET_MANIFEST.md`.
- Responsive photo comparator with desktop side-by-side and mobile A/B toggle.
- Circle/polygon hit testing, found markers, hints, misclicks and completion.
- Local save fallback with versioned schema.
- Mock platform adapter and diagnostics copy.
