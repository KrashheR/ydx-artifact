# SFX asset intake checklist

Status: no audio files are accepted or wired yet.  
Owner: sound-design / content intake.  
Companion specification: [`SFX_PRODUCTION_PLAN.md`](./SFX_PRODUCTION_PLAN.md).

This is the hand-off list for stock searches or generation. It deliberately
does not create placeholder files: runtime integration begins only after each
chosen asset has a commercial-web license and provenance record.

## Delivery contract

For every accepted cue deliver:

- editable master WAV: 48 kHz, 24-bit, with no clipped peak;
- web derivative: MP3, normally 96–128 kbps; mono for one-shots unless stereo
  has an intentional creative role;
- a stable filename made from the cue id and variant, for example
  `game-correct-01.mp3`;
- source URL or generator, author/model, date, prompt (for generated material),
  commercial redistribution permission, duration, channels, sample rate,
  compressed bytes, integrated loudness and true peak;
- loop start/end points for beds.

Masters must remain outside `public/`. Only approved web derivatives will go
under `public/assets/audio/`; their provenance must then be added to
`ASSET_PROVENANCE.json` and `ASSET_MANIFEST.md`.

## Release-critical one-shots

| Cue ID | Needed variants | Search / generation direction | Future owner and trigger |
| --- | ---: | --- | --- |
| `game.correct` | 5 | Soft pencil check on archive paper, tiny warm brass/glass response; dry, restrained, not a coin | `GameScreen` after accepted `PhotoComparator.onDifference` |
| `game.correct_sweetener` | 3 progress tiers | Very subtle warm analog bloom; 8–12 dB below correct, no combo fanfare | `GameScreen`, only as progress sweetener |
| `game.misclick` | 3–4 | Blunt pencil tap on thick paper plus muted wood; non-punishing, dry | `GameScreen` after `PhotoComparator.onMisclick` |
| `compare.flip` | 3 | Vintage photo-card flip plus small slide-viewer mechanism click | `PhotoComparator` A/B flip button; cooldown required |
| `compare.slider_grab` | 2 | Tiny brass precision-slider grab click | `PhotoComparator` slider `pointerdown` only, never `pointermove` |
| `hint.activate` | 3 | Magnifying glass / brass handling and quiet airy lift; no magic | `GameScreen` when a hint is committed |
| `hint.reveal` | 2–3 | Warm, filtered focus shimmer; no harp or sonar | `GameScreen` when the hint area becomes visible |
| `game.final_difference` | 2 (campaign/daily) | Archive rubber stamp plus restrained warm resolution; no fanfare | `GameScreen` on the last valid difference, before the 200 ms completion delay |
| `game.timeout` | 2 | Gentle tape mechanism stop and folder closing; calm rather than failure sting | `GameScreen` when the timer reaches zero |
| `game.extend_time` | 2 | Tape-recorder relay click and gentle restart | `GameScreen` after a successful time extension |
| `game.victory` | 4 (2 motifs × campaign/daily ending) | 2–3 warm late-1970s analog notes over paper/brass; calm achievement | `GameScreen` when completion overlay opens |

## Artifact, reward, and campaign one-shots

| Cue ID | Needed variants | Search / generation direction | Future owner and trigger |
| --- | ---: | --- | --- |
| `artifact.clue_found` | 3 | Antique brass clasp with a restrained warm glint | `GameScreen` artifact discovery toast |
| `artifact.seal_set` | 2 | Wax seal pressed into archive paper, quiet and dense | `ArtifactRevealOverlay` sealed-card entrance |
| `artifact.seal_break` | 3 layers | Delicate dry wax splitting into a few fragments; never glass/bone | `ArtifactRevealOverlay`, about 150–250 ms before visual reveal |
| `artifact.reveal` | 3 material variants × 2 tonal endings | Evidence envelope opening, card sliding out, rare warm analog resonance | `ArtifactRevealOverlay` revealed phase of its 1400 ms ceremony |
| `reward.hint` | 3 | Magnifying glass placed in a felt case, soft glass/brass | Hint reward grant |
| `reward.daily` | 2 | Small archival date stamp and quiet magnifying-glass case click | Daily reward grant |
| `campaign.complete` | 1 motif + 3 campaign tails | Restrained expedition-archive resolution, distant radio and final stamp | Campaign report after level 13 only |

## UI, map, and collection one-shots

| Cue ID | Needed variants | Search / generation direction | Future owner and trigger |
| --- | ---: | --- | --- |
| `ui.primary` | 4 | Short soft brass-and-wood archive-equipment button click | Shared `Button` primary actions; no hover sound |
| `ui.secondary` | 3 | Short dry cardstock confirmation tap | Shared secondary buttons |
| `ui.back_close` | 3 | Archive card sliding back into a folder | Back and close actions |
| `ui.modal_open` | 2 | Small folder opening on a wooden desk | Modal entrance |
| `ui.modal_close` | 2 | Smaller inverse folder-close gesture | Modal dismissal |
| `ui.tab` | 3 | Paper index-divider flick | Tabs, including collection filter |
| `ui.locked` | 2 | Gentle antique brass latch that remains locked | Locked map/collection action; 250 ms cooldown |
| `map.node_open` | 3 | Map pin on paper plus short pencil route mark | `MapScreen` available node entry |
| `map.node_unlock` | 2 | Archive access seal released; index card slides forward | Actual first-time unlock only |
| `collection.open` | 2 | Quiet vintage card-catalog drawer opening | `CollectionScreen` entry |
| `collection.item_open` | 3 | Museum card lifted from paper/felt backing | Collection-item detail entry |
| `settings.change` | 2 | Tiny warm precision-instrument toggle | Audio-setting changes; plays at current SFX volume |
| `save.visible_success` | 2 | Very quiet pencil check | Only a deliberate visible save-state success, never autosave |
| `ui.error` | 2 | Soft muted mechanical double click, recoverable and non-alarming | Explicit recoverable UI error only |

## Music and ambience beds

| Cue ID | Count | Search / generation direction | Future screen scope |
| --- | ---: | --- | --- |
| `music.archive_hub` | 1 seamless 60–90 s stereo loop | Minimal late-1970s analog archive room, sparse low notes, no drums or lead melody | Home, map, collection, settings (duck 2 dB while settings is open) |
| `ambience.northern` | 1 seamless 45–75 s stereo loop | Cold wind, far radio-tower hum, calm; no storm/voices/horror | White Meridian gameplay |
| `ambience.sand` | 1 seamless 45–75 s stereo loop | Dry salt-desert air and faint distant metal resonance | Sand Meridian gameplay |
| `ambience.emerald` | 1 seamless 45–75 s stereo loop | Wet foliage and very distant water; no foreground birds/thunder | Emerald Meridian gameplay |

Beds need inaudible loop seams in headphones. They must crossfade 500–900 ms
on screen changes, duck 2–4 dB beneath victory, artifact reveal, and important
rewards, and fade out within 40–100 ms for platform mute or an ad.

## Acceptance before runtime integration

1. Score every candidate from 1–5 for laptop-speaker audibility, fatigue after
   30 repeats, archive-material fit, separation from ambience, appropriate
   reward promise, editability, and absence of music/voice/room tail/clipping.
   Accept only an average of at least 4 with no score below 3.
2. Run the 30-repeat test for `game.correct`, `game.misclick`, `compare.flip`,
   and `ui.primary` before approving them.
3. Reject casino/coin/fanfare, cartoon pop/boing, alarm/buzzer, horror,
   aggressive high-end bells, long UI tails, and slider ratchets.
4. Keep the initial critical bank (primary, correct, misclick, compare, hint)
   within 150–300 KB. All one-shots target 0.8–1.5 MB; the full compressed
   library should stay within 6–8 MB.

## Integration gate

When assets are ready, create the typed Web Audio layer described in the
production plan. It must own file paths, buses, round-robin selection,
cooldowns, voice limits, browser unlock/resume, user mix, visibility pause,
CrazyGames `muteAudio`, and ad mute. Do not call `new Audio()` from React
components. Update save schema, settings UI, asset manifests/provenance,
architecture, CrazyGames documentation, analytics, release QA and changelog in
that implementation change.
