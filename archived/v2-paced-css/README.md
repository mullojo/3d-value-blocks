# Value Blocks / Lab 002

A local, build-free Vue 3 + Tailwind CSS 4 material playground. Open `index.html` directly in a modern browser. No install, account, external fonts, or internet connection is needed.

For an HTTP preview, run from this directory:

```sh
python3 -m http.server 8317 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8317. Stop the preview with Ctrl-C.

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
- `geometry.js`: deterministic shell generation with bottom-to-top supported placements.
- `checks/build-queue.cjs`: deterministic fake-frame checks for pacing, population bounds, hidden-tab pauses, shrinking/growing targets, cancellation, and instant mode.
- `checks/geometry.cjs`: run with Node to verify geometry invariants and archived baseline checksums.
- `archived/v1-simple-start/index.html`: complete, independent Lab 001 snapshot, accessible through the footer. Its dependencies are copied locally and its SHA-256 manifest records the baseline.
- `styles.css`: Six-face CSS 3D geometry, lighting treatments, animation, and responsive UI. No WebGL required.
- `vendor/`: Vue 3.5.44 and Tailwind browser 4.3.4, downloaded from jsDelivr on November 4, 2026. Both MIT licensed; see `vendor/NOTICE.md`.

This first study uses shade-based faces and gradients rather than physical lighting. Future experiments can add beveled geometry, selectable blocks, and richer composition. Scene choices reset on reload; saved materials persist in the same browser and origin. A 1,000-block build uses a bounded set of moving cubes plus the exposed surfaces of the landed group, rather than mounting 6,000 faces at the start. The completed 10×10×10 group renders 600 faces on 488 exterior cube elements. Performance varies by device. Switching themes or materials updates the scene without replaying the drop.

## Upstream references

- https://vuejs.org/guide/quick-start.html
- https://tailwindcss.com/docs/installation/play-cdn

The main page uses `vendor/tailwind.css`, a saved Tailwind 4.3.4 compilation with the full static theme and the existing utility classes. Custom scene/control CSS lives in `styles.css`. If adding new Tailwind utilities, regenerate this CSS; changing color family/shade tokens requires no rebuild. The vendored browser compiler remains available for development and the independent Lab 001 archive keeps using its own original copy.
