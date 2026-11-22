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
