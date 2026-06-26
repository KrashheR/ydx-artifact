# Save Schema

Version: `1`

Stored fields: completed levels, best results, in-progress level, magnifiers, artifacts, daily streak, settings and purchase flags. Runtime validation is in `src/entities/save/schema.ts`.

Local development may also set the purchase marker `dev-all-campaigns` inside `purchases.productIds` through the browser-console cheat hook exposed only in Vite dev mode.
