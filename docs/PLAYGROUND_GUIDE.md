> Preserved development notes from the pre-release playground, November 2026. Some passages describe earlier iterations. Start with the [public README](../README.md) and [architecture guide](ARCHITECTURE.md) for the current overview. Commands below run from the repository root.

# Value Blocks / Lab 004

A local, build-free Vue 3 + Tailwind CSS 4 material playground. Open `index.html` directly in a modern browser. No install, account, external fonts, or internet connection is needed.

For an HTTP preview, run from this directory:

```sh
python3 -m http.server 8317 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8317. Stop the preview with Ctrl-C.

## Time studies

Switch **Arrange value by → Time** to study real civil calendars with seeded sample totals. Counts mode and its original CSS/GPU choices remain available; leaving Time restores the previous count-view camera, renderer, motion, zoom and drop preference.

- **Day:** one daily cubit with a 27-block capacity. Fill is deterministic: X moves left to right, Z moves back to front, all nine cells in the bottom layer precede the middle layer, then the top layer. The inspector can set any day to 0–27.
- **Week:** seven separate daily towers (one block per value), ordered by the selected Monday/Sunday start. Weeks can cross month and year boundaries.
- **Month:** one daily tower per actual date, in seven weekday columns and up to six rows. Leading/trailing calendar slots remain blank. Weekday labels and a collapsible corner calendar of dates and totals support inspection. Selecting a corner date updates the inspector and highlights its floor cell.
- **Year:** twelve actual monthly boards, including leap days. Choose a wide four-by-three Gallery or three-by-four Quarters. Month-name buttons drill down. Year uses GPU; switching back to CSS shows a single month.
- **Spacing and labels:** Week, month and year default to Compact (column pitches 2 and 4, versus 5 and 7 in Airy; year also uses pitch 4 and tighter month-board gaps). Cubits keep enough room for their 3×3 footprints. Day/week totals float above stacks; month totals can appear above stacks, in a flat corner calendar, or both (the default), using the Month totals selector, and the year uses monthly-total tags. Nearby tags spread into free space above their anchor with thin connector lines.
- **Shape variant:** Daily cubits can replace towers in week, month or year. A day always uses its cubit. **3D view / Top view**, drag orbit and up to 800% zoom support exploring density. Continuous spin/float controls stay in Counts so projected calendar labels remain aligned.
- **Sample data:** 10–20 blocks/day by default, adjustable within 0–27. Counts are a stable hash of ISO date and seed, independent of viewed period. New daily estimates reseeds and clears manual overrides. The same date keeps its value when changing views; changing the estimate range also retains overrides until reset.
- **Gradient:** Color by → Daily total gradient shades each entire daily stack with the selected Tailwind family. A fixed 1–27 total maps to shades 200–800; higher daily totals are darker. The scale stays consistent across dates, periods and shapes, in CSS and GPU. The legend shows the range; zero days keep their empty floor cell. Switching color modes does not replay the build.
- **Color:** Random blocks is the Time default. Each block has a date-and-block-index color key, so it keeps its hue across day/week/month/year, tower/cubit shapes and spacing changes. It uses the Tailwind rainbow or the selected saved palette. Weekday, month, and material grouping remain options, including 200/500/800 shades. Counts mode restores its previous palette mode when leaving Time.
- **Calendar logic:** UTC civil-date arithmetic avoids DST offsets. This is actual Gregorian date layout, not connected event/account data. Sample values, overrides and Time settings are session-only and reset on reload; saved material palettes still persist in localStorage.

Dates from 2000–2100 are available in the UI. CSS handles all day/week/month totals (at most 837 blocks for a 31-day month at full capacity); the full year requires WebGL2. Month floor geometry and weekday labels project with the current camera in either renderer. GPU calendar cells use a sparse occupancy map, so a wide year board does not allocate a huge solid 3D grid.

## Renderer choice and large scenes

The default **CSS · original style** preserves the previous material treatment and paced DOM animation, up to 1,000 blocks. Select **GPU · up to 100,000** for WebGL2 surface instancing at any count. The styles are separate renderers: the GPU shader approximates the same Tailwind face/edge palette, satin/gloss/matte, and directional face shading; the CSS appearance remains available unchanged. Switching from a large GPU group to CSS clamps the current fill to 1,000 blocks.

GPU mode adds a 9,855-block person-year preset (27 × 365), 60,000 and 100,000 presets, and an exact-count input. Its fill slider keeps the settled prefix when resized. Replay and reshuffle start fresh. Frame-budgeted preparation/topology work stays cancelable; drops use shader-driven positions and a maximum of 4,096 in-flight cubes. Large-group pace scales with count to aim at roughly 25 seconds plus flight/preparation time at the default pace. Dropping off skips animation, while CPU preparation still completes in short slices.

All 100,000 block positions are stored. Only exposed landed faces are drawn: the 100,000-block shell has 13,038 quads, versus 600,000 total block faces. It uses one instanced draw for settled surfaces and a second draw for arriving faces. Covered faces are removed as each block lands, using constant-time slot swapping. No per-block DOM or Vue objects are created in GPU mode. One shared quad and typed buffers/textures serve the scene; no remote dependencies are required.

The metric strip shows actual submitted face/draw counts, frame cadence while building/spinning, and preparation wall time. FPS comes from requestAnimationFrame samples, not GPU timer queries; it varies with device, viewport, power state, background throttling, and browser automation. The renderer caps pixel density at 1.5 and draws on demand when idle. Turn on Spin to observe sustained orbit cadence. GPU ground shading is an approximate screen-space shadow; CSS retains its original ground plane.

WebGL2 is required for GPU mode. If unavailable, CSS and the two independent archives remain usable. A lost GPU context shows a recovery message; switch to CSS or reload to restore GPU rendering.

## Explore

- Drag the stage to orbit, or use the keyboard-accessible X/Y sliders. The main-view −/+ buttons zoom in 20% steps (5–800%); Fit recenters and returns to 100% with Auto fit enabled, preserving rotation. Click or Tab into the scene and use +/=, −, or 0 to zoom/fit. Shortcuts ignore form fields and modified browser shortcuts. The Scale multiplier slider stays in sync.
- Pan with the directional pad, Shift-drag, or arrow keys while the scene is focused (Shift+arrows moves farther). Toggle Pan to make ordinary drag pan, including on touch screens; toggle it off to orbit. The pad’s center button recenters without changing zoom. Fit/0 and Reset view also clear pan. Blocks, calendar floors, and floating tags move together in CSS and GPU; corner calendars and controls stay fixed. Counts mode remembers its pan when visiting Time.
- Choose any of the 22 default Tailwind color families and 11 shades.
- Front uses the chosen shade, top uses the next lighter shade, sides use the next darker shade; endpoints clamp to 50 and 950.
- Set an independent same-family edge shade. Compare satin, gloss, and matte surfaces.
- Switch between one cube, a three-cube stack, a six-cube cluster, a perfect cubit (3×3×3 / 27), 100 blocks, and 1,000 blocks (10×10×10).
- The Random fill slider grows supported cubic shells from 1–1,000 blocks, with shuffled positions within each layer. Existing cells stay stable as the count rises. Reshuffle changes fill order and random color assignments.
- Turn on Drop into place for a paced vertical build; Replay drop rebuilds the arrangement. Build pace adjusts from 12–40 arrivals per second (32 by default), so 1,000 blocks take roughly 32 seconds on a healthy foreground tab. The progress strip counts landed blocks and in-flight arrivals. Slow frames reduce throughput rather than causing catch-up bursts. Reduced-motion preferences and disabling drops show the completed group immediately.
- Auto fit uses a conservative bounding sphere to frame groups at any rotation. The Scale multiplier ranges from 5–140%; with Auto fit off it scales the original 130px block directly. A multiplier above 100% can intentionally crop the scene.
- Use Solid, Rainbow, or Saved group palettes. Rainbow offers light (200), bright (500), and dark (800) shades across 17 chromatic families.
- Save up to 10 exact picker materials (face and edge shade), load them back into the picker, or remove them. Saved mode randomly distributes them across the group. Browser localStorage persists the palette; unavailable storage falls back to the current session.
- Try float/spin, scale, ground shadow, and light/dark canvas. System reduced-motion preferences pause animations.
- Copy material CSS for reuse. When the clipboard is unavailable, the button downloads a CSS file instead. The exported variables require Tailwind 4's theme tokens and the geometry/surface rules from `styles.css`.

## Files / next experiments

- `index.html`: UI, loaded with local Vue and precompiled Tailwind 4 CSS. All theme tokens remain available for dynamic color selection. There is no live Tailwind compiler or DOM scanner on the main page.
- `app.js`: Vue state and reusable `ValueCube` component. Rendered positions are centered and use negative Y upward. Cube size and grid spacing are 130px. Enclosed faces and fully enclosed cube elements are removed incrementally as arrivals land. Upcoming cubes are data records until their scheduled flight; they are not mounted as offscreen DOM.
- `build-queue.js`: frame-paced scheduler; at most two new cubes per animation frame and 32 in flight. Arrival updates preserve existing components. The CSS `will-change` hint is applied only to in-flight cubes.
- `time-layout.js`: UTC calendar periods, deterministic daily estimates, custom coordinates, labels/pads, navigation, and screen projection.
- `checks/time-layout.cjs`: day fill order, unique supported cells, zero/full days, cross-view totals, weekday offsets, leap years, and navigation.
- `gpu-renderer.js`: dependency-free WebGL2 shaders, surface frontier, batched generation, instanced draws, shader drops, palettes, and frame metrics.
- `checks/gpu-renderer.cjs`: actual CPU topology/scheduling pipeline exercised with a mocked GL boundary through 100,000 blocks. Browser checks separately verify real shaders and rendering.
- `geometry.js`: deterministic shell generation with bottom-to-top supported placements, with an incremental generator through 100,000 cells.
- `checks/build-queue.cjs`: deterministic fake-frame checks for pacing, population bounds, hidden-tab pauses, shrinking/growing targets, cancellation, and instant mode.
- `checks/geometry.cjs`: run with Node to verify geometry invariants and archived baseline checksums.
- `archived/v3-gpu-counts/index.html`: complete independent Lab 003 snapshot before Time arrangements.
- `archived/v2-paced-css/index.html`: independent snapshot of the paced CSS playground before GPU work.
- `archived/v1-simple-start/index.html`: complete, independent Lab 001 snapshot, accessible through the footer. Its dependencies are copied locally and its SHA-256 manifest records the baseline.
- `styles.css`: Six-face CSS 3D geometry, lighting treatments, animation, and responsive UI. No WebGL required.
- `vendor/`: Vue 3.5.44 and Tailwind browser 4.3.4, downloaded from jsDelivr on November 4, 2026. Both MIT licensed; see `vendor/NOTICE.md`.

This first study uses shade-based faces and gradients rather than physical lighting. Future experiments can add beveled geometry, selectable blocks, and richer composition. Scene choices reset on reload; saved materials persist in the same browser and origin. A 1,000-block build uses a bounded set of moving cubes plus the exposed surfaces of the landed group, rather than mounting 6,000 faces at the start. In CSS mode the completed 10×10×10 group renders 600 faces on 488 exterior cube elements; GPU mode renders those 600 quads in one draw. Performance varies by device. Switching themes or materials updates the scene without replaying the drop.

## Upstream references

- https://vuejs.org/guide/quick-start.html
- https://tailwindcss.com/docs/installation/play-cdn

The main page uses `vendor/tailwind.css`, a saved Tailwind 4.3.4 compilation with the full static theme and the existing utility classes. Custom scene/control CSS lives in `styles.css`. If adding new Tailwind utilities, regenerate this CSS; changing color family/shade tokens requires no rebuild. The vendored browser compiler remains available for development and the independent Lab 001 archive keeps using its own original copy.

## Value simulations and count studies

Both modes show modeled USD value, estimated hours, and the baseline value for the entire selected count or calendar period. Each block assumes approximately one hour and a $100 base value. The shared $100–$1,000 slider (in $25 steps) changes modeled dollars per block without changing hours, blocks, or replaying arrivals. Time’s selected-day inspector also shows its own dollar/hour totals. These are local simulation assumptions, not recorded earnings; assumptions reset on reload.

Counts now offers Growing volume (original), 27-block towers, and groups of perfect cubits. Groups fill sequentially to 27, then start the next; a final partial group preserves the exact count. Compact/Airy spacing and 3D/Top camera buttons support comparing the arrangements. Group palette → Gradient uses the selected Tailwind family from shade 200 at the bottom to 800 at the top; it measures height rather than the daily totals used by Time’s gradient. Counts restores its palette/camera when leaving Time. CSS supports groups through 1,000 blocks and GPU through 100,000. Scattered towers expose more faces than a solid volume, so their rendering cost is higher.

Run `checks/count-groups.cjs` for grouping totals, uniqueness, support, bounds, and layer-first cubit order through 100k; `checks/gpu-renderer.cjs` also exercises both grouped layouts in the GPU pipeline.

## Journal layout studies

The third tab is a local prototype for journals of recorded value blocks, using explicitly simulated entries for November 15–17, 2026. It keeps Counts and Time mounted and preserves their settings; the GPU scene pauses while Journal is visible. The six-face CSS cube geometry is reused in small specimens rather than instantiating a canvas for every row.

- **Daily flow:** time, text, frame context, and real 3D blocks growing to the right, with per-entry quantities and modeled dollars.
- **People & stacks:** contributor portraits and vertical stacks beside each contribution. Heal the Bay defaults to contributor colors; Sustainable Joy uses its project palette.
- **Frame stories:** frame cards with cumulative block sculptures and links to the underlying entries.
- **Journals:** the Life journal spans six named frames (with codes); Heal the Bay and Sustainable Joy assume their project context and omit repeated frame tags on each entry. Any layout can be applied to any journal.
- **Explore:** search titles, notes, people and frames; filter by real date or life frame; switch block colors; hide notes; select an entry for its detail panel; open its stack in the main Counts lab. Empty results have a reset action. The shared $100–$1,000 value slider updates summaries across all three tabs.

`journal.js` holds simulated data, `JournalBlocks`, and `JournalLab`. `journal.css` scopes editorial layouts to Journal. Portraits are bundled locally with source notes in `journal-assets/README.md`, and have initials fallbacks. They illustrate fictional contributors, not actual records or organizational affiliations. Nothing is sent, saved to a service, or published. Run `checks/journal.cjs` to verify data integrity, capacity, dates, totals, and local portrait assets.


## Interactive film credits

Journal → **04 / Film credits** is a fictional end-credit study for *The Light We Leave*, a 14-minute short. Twenty-four fictional cast and crew members contribute 1,420 value blocks across six departments. Quantities represent estimated hours across the whole production, not a single day. All 24 illustrative portraits are bundled locally; Profile photos can be turned off for a traditional text-and-block roll.

The roll plays at 26 px/s by default (adjustable 12–60), with Play/Pause, Restart, department jumps, a progress indicator, native scrolling, and drag scrubbing. Dragging or wheel-scrolling pauses the roll. A drag never selects a row accidentally. Click anywhere on a credit, including its blocks, to pause and inspect its work, hours, and modeled value; an action opens the full quantity in Counts. Space plays/pauses when the roll has focus, arrows scroll, and Home/End jump. Mobile selections scroll to the contribution details, with a return-to-credits action. Reduced-motion preferences disable autoplay. Playback suspends when the roll leaves the screen, the Journal layout changes, or the browser tab is hidden.

`film-credits.js` provides sample data, the playback controller, and `FilmBlockStrip`. The dense miniature rows draw the same three visible cube faces into small cached canvases, with one individually drawn cube per block; 24 row canvases replace thousands of 3D DOM elements. They repaint only on size/data/color changes, not on every animation frame. The opening motif uses `JournalBlocks` and the main lab retains the original CSS and GPU renderers. `film-credits.css` keeps the cinema dark in either page theme. `checks/film-credits.cjs` verifies portraits and exact totals, strip bounds, playback/pause, offscreen/background suspension, drag suppression, selection, jumps, restart, reduced motion, ending, and cleanup.


## Whole-film finale and concept giving

At the bottom of the credit roll (autoplay, keyboard, drag, or native scroll), a final scene reunites the exact 1,420 contributed blocks into one live WebGL stack. Each department retains its original color and exact quantity. The build runs for roughly 40 seconds, with Pause/Resume, Replay drop, and Orbit controls. Rendering pauses when the scene leaves the screen, Journal is hidden, or the browser tab is hidden. Reduced motion renders the completed stack immediately. A static projected 3D view of the full stack is the fallback when WebGL is unavailable.

A concept giving invitation remains beside the animation. Its local SVG is a real QR encoding `https://thelightweleave.example/give`, a reserved demo address. No payment destination or checkout is connected. The $10/$25/$50 controls only show a local preview; nothing is charged, stored, or submitted. QR metadata is in `journal-assets/film-giving-concept.json`; `vendor/qrcode-generator.js` (MIT) generated the SVG and is not loaded at runtime.

Use the credits’ **Finale / giving concept** jump or **Watch the film take shape** button to preview without waiting for the roll. Back to credits preserves the roll; Watch the credits again resets it. `film-finale.js` contains the 3D scene and exact contribution-to-cell mapping. `checks/film-finale.cjs` verifies counts, support, department colors, and reproducible QR output; the GPU pipeline check includes the full animated 1,420-block finale.

The finale QR now borrows **Scan It** (`QR-Code-Maker`)’s dotted modules, extra-rounded finder rings, and built-in spark symbol. Gold `#e4ca94` on charcoal `#131417` fits the film palette. It retains a four-module quiet zone and uses high error correction around the central symbol. Rebuild the local SVG and metadata with `node scripts/build-film-qr.cjs`. The SVG is the only asset loaded by the giving panel; no extra runtime library or network call is needed.

`checks/qr-style-preview.html` uses a locally vendored jsQR decoder to verify the full artwork at 200/234/244/320 px, plus larger matrix-only captures. Captions remain outside the quiet zone. The checked payload is still the reserved concept URL, with no live checkout. Latest decode results are saved in `checks/qr-style-browser-results.json`.

## Inputs: browser-local recording studies

The fourth main tab provides four ways to record real playground entries, separate from Journal’s fixed concept data:

- **Quick Note:** a life entry with title, frame, 1–27 whole blocks, and optional notes.
- **Paste a Day:** one line per entry, beginning with colored square emoji (spaces optional), `2x`, `+2`, `[2]`, or `2`. Add `|Hlth,Veg|` frame codes, `@Ada` / `@Leo` / `@Maya` / `@Sam`, `<Project name>`, and ` // optional notes`. Date and default person come from the controls. Known frame codes are case-insensitive; custom short codes are preserved. A parsed preview is shown before saving.
- **Project Desk:** a named project, shared frame, selected contributor, contribution title, quantity, and optional notes. Suggested project names are editable.
- **Tap a Cubit:** choose a life frame and tap the last block across three 3×3 layers to set the entry’s quantity, then record it.

One person can record at most 27 blocks for a date **across all life frames and projects**. Both forms and pasted batches use the same authoritative validator; batches save all-or-nothing, with no clipping. Live daily cubits combine actual entry colors and build as quantities are added. People & Stacks is the default saved-row display, with Daily Flow available. Journal’s initial layout is also now People & Stacks. Larger individual entries fold into cubits to keep rows readable.

Entries persist in the browser’s localStorage under `value-blocks-inputs-v1` (version 1). Reloading preserves them. Delete individual entries or clear all Inputs entries; Undo restores the previous collection until the next action or reload. Clearing this store does not affect saved materials or the simulated Journal datasets. Storage failures are surfaced as session-only operation. Other tabs’ storage changes refresh the display, and saves re-read the latest collection. This is a local playground, not a shared multi-user database.

`input-model.js` handles parsing, validation, totals, restoration, and atomic batch checks; `inputs.js` / `inputs.css` provide the four interfaces. `checks/inputs.cjs` covers shorthand, metadata, dates, combined-context limits, batch rejection, people/date independence, persistence format, and corrupt data. Use **Try a sample day** in an empty date to save a small fictional group of entries and experiment with deletion/undo.


### A life journal includes project work

Inputs’ **Life journal** now includes every contribution, including named project frames. **Project team** is a view of the same records for one chosen project, not a second collection or a second daily allowance. Quick Note’s Frame selector includes named project frames, so project work can be recorded naturally inside a life journal and appear in its team view. Love (`Lov`) and Cooperation (`Coop`) sit alongside rest, movement, learning, making, and the project frames.

A richer simulated starter is added once to today and yesterday, preserving existing entries. Fresh demo days have 24 entries / 74 blocks across four people, with general and project frames for everyone; existing contributions reduce each person’s simulated top-up so daily limits are respected. Demo records are explicitly labeled. **Refresh demo day** replaces only that date’s simulated entries; **Remove demos** removes only simulated records and preserves your own entries. Undo is available. Clear or remove actions do not cause demos to reappear on reload.

The daily-cubit arrival effect now animates only translation. Animating opacity on the preserve-3D cube was flattening its children before rotation and hiding the top/side faces; the drop motion remains without that grouping effect.

### Types: human, gift, and robot contribution studies

The **Types** tab introduces solid human blocks, darker gift blocks, and transparent robot blocks. A rotatable CSS 3D scene fills supported cells from the bottom back corner. The default places human inputs first, then their derived robot expansion, then independent gift chunks. Journal arrival order and the embedded-core arrangement remain alternative explorations. Separate groups present human, robot, and gift contributions side by side with their counts and estimates. Independent type filters preserve positions, update the visible subtotal and journal details, and retain full-project totals and draft Gratitude eligibility. Six fictional project stories include New Game, Value Blocks Lab, and New Web, with chronological contributions, named people, notes, and quantities that follow the controls. Shared or per-type Tailwind colors, four palette presets, glass/wireframe settings, keyboard rotation, and an optional slow orbit let you explore the relationships. The orbit pauses off-tab and respects reduced motion.

Each type uses a $100 concept baseline. Human blocks represent about one hour contributed; gift blocks represent existing resources; robot blocks estimate human effort saved and require human input. The combined contribution estimate shows all three components explicitly. Illustrative 1–10× gift fills are separate from that total. Draft Gratitude potential is 100 `<G>` units per assumed qualifying human block; gifts and robots never add issuance potential. Bitcoin giving and Gratitude issuance remain explanatory concepts with no wallet or transfer integration.

`types.js` contains the isolated model and Vue components; `types.css` provides the distinct materials and responsive layout. Run `node checks/types.cjs` to verify arithmetic, human dependency, fill separation, issuance boundaries, unique geometry, and the embedded core.

The Gratitude mark is an accessible inline SVG of `<G>`, reused at badge, formula, and headline sizes. `checks/types.cjs` also checks chronology, story allocation when quantities change, supported cells, and every type-filter combination.

Filtering the combined Types stack has two spacing options: **Keep positions** preserves the complete project’s cell coordinates, while **Compact restack** rebuilds just the visible contributions in their original arrival order and fits the smaller volume. Separate groups stay compact within each type. Filters never change the underlying project or Gratitude potential. Monetary fill highlights on human and gift blocks rise along the vertical faces; the bottom is highlighted first and the top only at full capacity. Transparent robot blocks retain a subtly tinted base rather than a monetary fill. The Gratitude amount has an explicit large type size independent of shared heading-label styles.

The combined stack includes an in-scene summary strip for human, robot, and gift counts and value estimates, plus the visible total. Its colors follow the type palette and its figures follow the filters. The camera reserves space above the strip; narrow scenes arrange the summaries in two rows. The flat summary is outside the preserve-3D tree and does not intercept drag gestures.

### Types rendering performance

Types mounts on its first visit. A stack uses one `TypesMesh` component per material/type, with inherited CSS material variables, memoized cube nodes, and static face markup. Geometry depends on quantities and ordering; fills, colors, draft eligibility, and keep-position filters reuse it. Keep-position filters hide an existing batch. Combined and separate layouts stay mounted after their first visit, retain their buffers while hidden, and synchronize quantities on return. Number formatters are reused. Opaque faces are backface-culled, and robot faces skip empty sheen pseudo-elements. The six-face CSS materials and transparent expansion are retained.

`node checks/types-reactivity.cjs` verifies geometry and mesh identity across appearance changes, filter behavior, and synchronization of cached layouts with the latest quantities.


### Human input × robot expansion

Types records human input plus a chosen estimated robot multiple (0–30×). Robot blocks are derived exactly as `human blocks × multiple`: 3 human blocks at 10× produce 30 robot blocks. Presets have scenario-specific multiples. Each simulated human entry is followed by its linked robot expansion, with the input count and multiplier shown in the journal; combined, compact, and separate layouts use the same linked quantities. The default type-layer order shows human input, its expansion, and then gifts; the journal-arrival option follows each input and its expansion as successive events. Gift chunks remain independent contributions with giver names and arrival times, usually after the work. Gift amounts and gift-fill multipliers do not change the robot multiple. The estimate is illustrative, and only human contributions remain a draft Gratitude source.

### Special human blocks

At the bottom of Types, **Special blocks** explores an Embedded Bitcoin Human Value Block: an orange Bitcoin coin inside a cutaway human cube, three sponsorship sources, and a reversible owner-release preview. The visual follows the selected human color and supports pointer/keyboard rotation and reduced motion. It is a local concept interaction with no wallets or funds connected. [Read the protocol summary](embedded-bitcoin-human-value-blocks/README.md), including confirmed rules and ideas still under discussion.

The embedded-Bitcoin explorer has five numbered variants: **01 Porthole**, **02 Crystal**, **03 Coin recess**, **04 Value stamp**, and **05 Corner signal**. Select a numbered tab or use **Next design**. Each variant includes 56px / 32px / 20px examples and a 27-block stack for judging recognition at scale. Crystal keeps the whole dimensional coin visible through a human-colored glass shell; the stamp and corner treatments emphasize exterior recognition. The stamp’s 10,000-sat label is illustrative, not a live conversion.
