# Value Blocks / Lab 001

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
- Switch between one cube, a three-cube stack, and a six-cube cluster.
- Try float/spin, scale, ground shadow, and light/dark canvas. System reduced-motion preferences pause animations.
- Copy material CSS for reuse. When the clipboard is unavailable, the button downloads a CSS file instead. The exported variables require Tailwind 4's theme tokens and the geometry/surface rules from `styles.css`.

## Files / next experiments

- `index.html`: UI, loaded with local browser builds. `theme(static)` retains all theme tokens for dynamic color selection.
- `app.js`: Vue state and reusable `ValueCube` component. Positions are `[x, y, z]` in cube units; negative Y stacks upward. Cube size and grid spacing are currently 130px.
- `styles.css`: Six-face CSS 3D geometry, lighting treatments, animation, and responsive UI. No WebGL required.
- `vendor/`: Vue 3.5.44 and Tailwind browser 4.3.4, downloaded from jsDelivr on November 4, 2026. Both MIT licensed; see `vendor/NOTICE.md`.

This first study uses shade-based faces and gradients rather than physical lighting. Future experiments can add per-block palettes, beveled geometry, selectable blocks, and richer composition. UI choices reset on reload.

## Upstream references

- https://vuejs.org/guide/quick-start.html
- https://tailwindcss.com/docs/installation/play-cdn

The browser compiler is intended for development and is well suited to this local experiment. A production integration should precompile Tailwind.
