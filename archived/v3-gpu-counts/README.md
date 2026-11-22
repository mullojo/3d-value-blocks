# Value Blocks / Lab 003

A local, build-free Vue 3 + Tailwind CSS 4 material playground. Open `index.html` directly in a modern browser. No install, account, external fonts, or internet connection is needed.

For an HTTP preview, run from this directory:

```sh
python3 -m http.server 8317 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8317. Stop the preview with Ctrl-C.

## Renderer choice and large scenes

The default **CSS · original style** preserves the previous material treatment and paced DOM animation, up to 1,000 blocks. Select **GPU · up to 100,000** for WebGL2 surface instancing at any count. The styles are separate renderers: the GPU shader approximates the same Tailwind face/edge palette, satin/gloss/matte, and directional face shading; the CSS appearance remains available unchanged. Switching from a large GPU group to CSS clamps the current fill to 1,000 blocks.

GPU mode adds a 9,855-block person-year preset (27 × 365), 60,000 and 100,000 presets, and an exact-count input. Its fill slider keeps the settled prefix when resized. Replay and reshuffle start fresh. Frame-budgeted preparation/topology work stays cancelable; drops use shader-driven positions and a maximum of 4,096 in-flight cubes. Large-group pace scales with count to aim at roughly 25 seconds plus flight/preparation time at the default pace. Dropping off skips animation, while CPU preparation still completes in short slices.

All 100,000 block positions are stored. Only exposed landed faces are drawn: the 100,000-block shell has 13,038 quads, versus 600,000 total block faces. It uses one instanced draw for settled surfaces and a second draw for arriving faces. Covered faces are removed as each block lands, using constant-time slot swapping. No per-block DOM or Vue objects are created in GPU mode. One shared quad and typed buffers/textures serve the scene; no remote dependencies are required.

The metric strip shows actual submitted face/draw counts, frame cadence while building/spinning, and preparation wall time. FPS comes from requestAnimationFrame samples, not GPU timer queries; it varies with device, viewport, power state, background throttling, and browser automation. The renderer caps pixel density at 1.5 and draws on demand when idle. Turn on Spin to observe sustained orbit cadence. GPU ground shading is an approximate screen-space shadow; CSS retains its original ground plane.

WebGL2 is required for GPU mode. If unavailable, CSS and the two independent archives remain usable. A lost GPU context shows a recovery message; switch to CSS or reload to restore GPU rendering.

## Explore

- Drag the stage to orbit, or use the keyboard-accessible X/Y sliders.
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
- `gpu-renderer.js`: dependency-free WebGL2 shaders, surface frontier, batched generation, instanced draws, shader drops, palettes, and frame metrics.
- `checks/gpu-renderer.cjs`: actual CPU topology/scheduling pipeline exercised with a mocked GL boundary through 100,000 blocks. Browser checks separately verify real shaders and rendering.
- `geometry.js`: deterministic shell generation with bottom-to-top supported placements, with an incremental generator through 100,000 cells.
- `checks/build-queue.cjs`: deterministic fake-frame checks for pacing, population bounds, hidden-tab pauses, shrinking/growing targets, cancellation, and instant mode.
- `checks/geometry.cjs`: run with Node to verify geometry invariants and archived baseline checksums.
- `archived/v2-paced-css/index.html`: independent snapshot of the paced CSS playground before GPU work.
- `archived/v1-simple-start/index.html`: complete, independent Lab 001 snapshot, accessible through the footer. Its dependencies are copied locally and its SHA-256 manifest records the baseline.
- `styles.css`: Six-face CSS 3D geometry, lighting treatments, animation, and responsive UI. No WebGL required.
- `vendor/`: Vue 3.5.44 and Tailwind browser 4.3.4, downloaded from jsDelivr on November 4, 2026. Both MIT licensed; see `vendor/NOTICE.md`.

This first study uses shade-based faces and gradients rather than physical lighting. Future experiments can add beveled geometry, selectable blocks, and richer composition. Scene choices reset on reload; saved materials persist in the same browser and origin. A 1,000-block build uses a bounded set of moving cubes plus the exposed surfaces of the landed group, rather than mounting 6,000 faces at the start. In CSS mode the completed 10×10×10 group renders 600 faces on 488 exterior cube elements; GPU mode renders those 600 quads in one draw. Performance varies by device. Switching themes or materials updates the scene without replaying the drop.

## Upstream references

- https://vuejs.org/guide/quick-start.html
- https://tailwindcss.com/docs/installation/play-cdn

The main page uses `vendor/tailwind.css`, a saved Tailwind 4.3.4 compilation with the full static theme and the existing utility classes. Custom scene/control CSS lives in `styles.css`. If adding new Tailwind utilities, regenerate this CSS; changing color family/shade tokens requires no rebuild. The vendored browser compiler remains available for development and the independent Lab 001 archive keeps using its own original copy.
