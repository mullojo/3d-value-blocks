# Contributing

This is a creative playground for value-block interfaces. Small, focused experiments are welcome: better materials, clearer layouts, accessible controls, faster rendering, and useful examples of life and work being recognized.

## Start locally

Open `index.html`, or use the local server command in the [README](README.md). No package install is required. Use Node.js 22+ for checks:

```sh
node scripts/check.cjs
```

A proposed change should explain the interaction it improves and include a screenshot or short recording when visual behavior changes. Include the browser and device used for validation. Report bugs or suggest experiments with the repository’s issue templates once it is published.

## Keep the experiment coherent

- Preserve the build-free, local-first setup and original CSS rendering option. Keep runtime dependencies local and document their licenses.
- Use one color and tone within a journal entry’s block group. Project palettes can distinguish kinds of work. The studio’s purely visual color experiments can remain playful.
- Write sample contributions as lived actions, usually in the past tense: “made pancakes,” “taught ocean awareness,” or “coded the new controls.” Include project work in life journals too.
- Keep the 27-human-block limit shared across a person’s life frames and projects for a date. Robot estimates follow human input × the selected multiple; gifts remain separate.
- Keep modeled values and draft protocol ideas clearly explained. Wallet operations, currency issuance, and real payment handling would be a separate implementation effort.
- Preserve `archived/` as historical baselines. Add current experiments to the main playground rather than rewriting archived versions.
- Respect keyboard use, focus states, reduced-motion preferences, light/dark backgrounds, and smaller screens.

For logic or performance changes, add a focused regression check where it meaningfully protects behavior. For visual changes, inspect the affected modes in a browser; model checks cannot verify the look of 3D faces or animation smoothness. GPU and CSS appearances should both be checked when shared geometry changes.

## Assets and public examples

Use fictional sample records and affiliations. Do not commit personal journal exports, credentials, private keys, or unlicensed images. Include source and license information for new third-party assets in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the relevant asset manifest. Existing portraits are illustrative Unsplash photographs, not actual project contributors.

The original project code and documentation use MIT. Contributions to those files are submitted under the same license; third-party materials retain their own licenses. Keep required copyright and license notices intact.

## Scope and discussion

For large architectural changes, new dependencies, or changes to contribution arithmetic, open an issue first so the visual and conceptual intent can be discussed. Be kind, specific, and constructive when reviewing experiments. Different visual approaches are welcome here.

## Recognizing contribution

The [human guide](docs/HUMAN_VALUE_BLOCKS_GUIDE.md) and [human journal](docs/HUMAN_VALUE_BLOCKS.md) show how we can recognize direction, design, testing, implementation oversight, and publishing—not just code typed. The [robot guide](docs/ROBOT_VALUE_BLOCKS_GUIDE.md) keeps estimated AI expansion alongside the human input. These are draft recognition tools; code contributions do not require a particular multiplier or a recorded block allocation.
