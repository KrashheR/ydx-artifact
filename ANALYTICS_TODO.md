# Analytics TODO

Updated: 2026-07-21

## Release blockers requiring external access

- [x] Published all 30 missing goals from the 68-event typed registry to the
  configured production counter on 2026-07-21. Re-run `pnpm metrika:goals`
  before release and require `Missing: 0`.
- [ ] Run a draft/production smoke session and verify ingestion of at least
      `game_open`, `game_ready`, `onboarding_impression`, `level_attempt_start`,
      `difference_found`, and `level_attempt_end` in the target counter. Record the
      counter, build ID, content version and smoke time in the release evidence.

Do not direct production traffic until both items above are checked.

## Post-P0 follow-up

- [ ] Add sampled FPS/long-task telemetry after agreeing on sampling rate and
      performance budgets; current minimum telemetry covers ready timing, scene load,
      save failures and fatal errors.
- [ ] Add zoom state and privacy-safe nearby-misclick buckets if comparator zoom
      or coordinate diagnostics are introduced. Raw coordinates and per-tap Metrica
      events must remain prohibited.
- [ ] Add experiment/variant assignment before making causal claims about
      interstitial cadence or daily retention.
- [ ] Add the optional post-campaign setting-interest survey and
      `setting_interest_selected`; campaign exposure/eligibility/entry/completion is
      implemented, but behavioral data alone is not a direct preference signal.
- [ ] Build the five soft-launch dashboards and daily Logs API export described
      in the product audit after the first clean production data arrives.
