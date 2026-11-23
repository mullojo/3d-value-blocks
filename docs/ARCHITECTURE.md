# Architecture and local state

## Runtime

The main application is a static page. `index.html` loads local styles, the Vue global build, model scripts, component scripts, and finally `app.js`. Script ordering matters: there is no bundler or module resolver. Most components use Vue’s runtime templates and ordinary JavaScript globals. Keep a complete local copy of the directory when opening the page as a file.

`vendor/tailwind.css` is the checked-in Tailwind theme and utility stylesheet. Custom scene and component CSS supplies the 3D materials and interface styling. The retained Tailwind browser compiler is not loaded by the current main page. Existing theme variables such as `--color-emerald-500` are available without a build; arbitrary new utility classes may require updating the compiled stylesheet or writing ordinary CSS.

| File / area | Responsibility |
| --- | --- |
| `index.html`, `app.js`, `styles.css` | Application shell, Count/Time controls, main scene, original cube component, keyboard/camera interactions |
| `geometry.js`, `build-queue.js` | Count geometry, paced preparation, and build scheduling |
| `gpu-renderer.js` | WebGL2 exposed-face instancing and shader-driven arrivals |
| `time-layout.js` | UTC civil-calendar arithmetic, daily estimates, spatial arrangements |
| `journal.js`, `journal.css` | Fictional journal examples, layouts, selection/details |
| `film-credits.js`, `film-credits.css`, `film-finale.js` | Interactive fictional film credits and final falling-block scene |
| `input-model.js`, `inputs.js`, `inputs.css` | Entry parsing and validation, browser storage, editing, input layout variants |
| `block-colors.js` | Persistent frame and project color configuration |
| `types.js`, `types.css`, `special-blocks.css` | Contribution arithmetic, type filters, cached material meshes, project stories, embedded-Bitcoin cube concepts |
| `lab.html`, `lab.js`, `lab-model.js`, `lab-data.js`, `lab.css` | Real read-only project journal, generated ledger snapshot, and existing Types cube materials |
| `gallery.html`, `gallery.css`, `gallery.js`, `gallery-assets/` | Static design gallery, accessible image viewer, and caption manifest |
| `journal-assets/` | Local illustrative portraits, provenance manifest, fictional film QR |
| `project-support.json`, `assets/support-bitcoin.svg` | Real project support destination and generated payment QR |
| `checks/`, `scripts/` | Dependency-free Node checks, local QR generators, browser verification page |
| `archived/` | Preserved historical playground versions |

## Rendering

Count scenes have separate CSS and GPU paths. CSS builds full six-face cubes and retains the original material finish. GPU mode stores block positions in typed data and submits exposed faces instead of creating a DOM element for every cube. Preparation is paced in cancelable slices; animation timing and the number of arriving cubes are bounded. Dense settled stacks benefit from hiding internal faces, so block count alone does not describe rendering cost.

Time reuses the main renderer with calendar-specific geometry and projected labels. The full year uses GPU; smaller periods can use CSS. Camera zoom and pan affect the scene and its projected labels together.

Journal and Inputs favor small CSS groups and per-person stacks. Types has its own CSS meshes: one batch per material/type, inherited material variables, and memoized cube markup. It mounts on first visit; previously visited combined/separate layouts are cached. Appearance controls and keep-position filters reuse geometry. Compact filters intentionally rebuild a condensed arrangement.

Transparency and visible face layering are part of the design. Check them in a browser after changing transform hierarchy, `overflow`, `opacity`, `backface-visibility`, or `transform-style`; these can flatten or clip CSS 3D descendants.

## Data boundaries

Input entries, frame/project color choices, and saved studio palettes use browser `localStorage`. Input entries are grouped by person and civil date; the human daily capacity is shared across frames and projects. Editing must exclude the original entry when validating the replacement so a re-save does not count it twice. Batch input validation is atomic.

Time sample data is deterministic for a date and seed; overrides and Time settings are session-only. Journal, film, and Types stories are simulated examples. A project is also a frame in a life journal, rather than a separate allowance of human blocks.

There is no backend, identity service, analytics, wallet integration, or financial settlement. Opening the same directory as `file:`, `localhost`, and `127.0.0.1` gives different browser storage contexts. The public support address and generated QR are documentation assets, not a transaction API.

## Checks and review

Run `node scripts/check.cjs` with Node 22+. It discovers every `checks/*.cjs` suite, runs each in a separate process, and fails if any suite fails. Checks cover geometry, calendar behavior, count groups, queue cancellation, GPU topology, input parsing/capacity, journal data, film totals and QR reproducibility, Types arithmetic and reactive reuse, and public repository assets.

`checks/qr-style-preview.html` provides an additional browser scan check for the styled film QR. Rebuild generated QRs only with their corresponding scripts: `scripts/build-film-qr.cjs` for the fictional film and `scripts/build-support-qr.cjs` for real project support.

For visual changes inspect the relevant view in light and dark modes, keyboard focus, reduced motion, and a narrower viewport. For shared scene changes, also inspect both CSS and GPU paths. Automated model checks do not establish a browser frame-rate target.

## Next explorations

Useful directions include clearer visual distinction at very small sizes, input accessibility, performance across devices, portable journal export/import, and more contribution stories. Economic and embedded-Bitcoin rules remain draft concepts; see the [protocol summary](embedded-bitcoin-human-value-blocks/README.md) for established ideas versus unresolved proposals.

## Real project journal

`lab.html` presents the recorded human ledger as Value Blocks Lab, with separate confirmed and reported contribution status. `scripts/build-lab-data.cjs` creates a local `lab-data.js` snapshot from the authoritative JSON ledger so file-based viewing needs no fetch request. Regenerate it after changing the ledger; `checks/lab.cjs` detects stale snapshots. `lab-model.js` allocates exact block counts and per-entry colors. Combined stacks follow each period’s human contributions and estimated robot expansion, filling each bottom layer first. By-type comparisons use a common scale; filters preserve positions in the combined stack. The page is read-only and does not create or confirm additional records.

The page reuses `TypesBlock` materials from the small shared `cube-materials.js` file and the six-face studio CSS; it does not load the studio’s example stories or full Types interface. Immutable cubes are cloned as native six-face DOM fragments in cancellable frame batches (up to 128 cubes / roughly 4 ms of preparation per frame), avoiding per-face Vue updates. A bounded cache keeps the six most recent scenario/scope models, and geometry is built lazily. An isolated viewer owns camera state, so rotation and zoom do not rerender the journal. The By type layout stays mounted for quick switching. Leaving Together disposes its renderer and canvas backing store or removes its CSS meshes. Filters hide existing material batches without destroying them. Orbit is opt-in, pauses in background tabs and when the main scene is offscreen, and respects reduced motion. Per-period robot previews rasterize near the viewport on a shared scratch canvas, then keep their still image for return visits. CSS previews mount near the viewport as a fallback. Narrow layouts omit those miniatures. Bob’s and Lindsay’s supplied portraits are in `lab-assets/`, separate from fictional journal portraits. Bob’s six original confirmed periods stay immutable in the ledger. The follow-up chapter adds three chat-estimated Bob blocks and a separately reported Lindsay review block, alongside her original six daily reports. Additional contributions merge into their corresponding display periods. Lindsay’s review hours are added equally to human input and the manual workload; new implementation workload lanes add robot estimates only for the new completed scope.

The Lab defaults to WebGL2 for the separate robot stack and the Together view. Cyan glass draws all six faces per block in one instanced draw so interior edges stay visible. Together draws solid human blocks first and tests the glass against their depth. Camera changes reuse the positions already uploaded to the GPU. The renderer skips offscreen draws, lowers the pixel budget during dragging and orbit, and restores detail when movement stops. The renderer toggle and fallback use the original CSS materials, which can render either layout and serve as the preview fallback. The stage measures its drawing area before showing either renderer and reserves room for the group captions.
