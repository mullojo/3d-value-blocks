# Robot value blocks · A starter guide

Human input can open a much larger field of work. Robot blocks are a way to draw that expansion without making the person disappear inside it.

**One robot block represents roughly one hour of human-equivalent effort estimated to have been saved by AI or automation, with a $100 reference unit.** It describes an estimate of work enabled or avoided, not an extra person who worked that hour.

Start with real human contribution. Then ask: **what would it take for this person to produce a comparable result without generative AI?** The [Value Blocks estimate](ROBOT_VALUE_BLOCKS.md) is this guide’s worked example, with a [structured ledger](value-block-records/ledger.json).

## Keep these three numbers visible

Let **H** be recorded human blocks and **W** the estimated total human hours for a comparable no-AI result.

```text
R = max(0, W − H)      robot blocks: additional human-equivalent effort saved
M = R / H             robot expansion per human input block
G = W / H = 1 + M     gross output gain, for W ≥ H and H > 0
```

If the estimate is below the actual human input, set R to zero and report that outcome; do not claim a gain. If H is zero, there is no human-linked estimate to multiply. These formulas use H as an approximate hour count, so uncertainty in the human journal matters too.

| A phrase someone uses | Human input | Additional robot blocks | Combined equivalent | Gross gain |
| --- | ---: | ---: | ---: | ---: |
| “10× robot expansion” | 3 | 30 | 33 | 11× |
| “10× as much total work” | 3 | 27 | 30 | 10× |

Both are useful; they describe different ratios. The playground’s current Types control uses **robot expansion M**: three human inputs at 10× produce thirty robot blocks. Always label the ratio in records. Avoid calling a total-output ratio and an additional-work ratio the same thing.

## Build the estimate from the work

1. **Freeze the delivered scope.** Name the commit or milestone and the behavior being reproduced. Count a finished prototype as a prototype, not a production service that has not been built.
2. **Record H independently.** Human attention is estimated from the person’s contribution. Do not increase H just to fit a desired AI multiplier.
3. **Make a workload map.** Divide the artifact into distinct areas: materials, rendering, data rules, interfaces, content, research, debugging, verification, and publishing. Include learning required for this person to reach the result.
4. **Budget three manual paths.** A fast path assumes relevant knowledge and few false starts. A working path assumes some learning and iteration. A deep path assumes substantial specialist ramp-up and experimentation. Use the same intended result and the same available libraries in all three.
5. **Avoid imaginary extra work.** Do not budget rebuilding Vue or writing a QR encoder when the no-AI developer could use those libraries too. Do not count archived copies, repeated screenshots, or generated assets as independently handwritten systems.
6. **Calculate R, M, and G.** Show the chosen human input and each workload scenario. The upper case can be exciting without masquerading as a measurement.
7. **Revisit with experience.** Ask the contributor which parts would have been familiar, slow, difficult, or unlikely to be attempted alone. A later timed manual task or a reported comparison can improve the estimate without replacing this first draft.

These are project-specific planning estimates. There is no need to import a generic productivity multiplier from a study or pretend the upper case is established by a large source file.

## Source volume is a cross-check

Lines of code help describe the artifact. They are poor value units on their own: a shader fix may be one line, a generated palette can be thousands, and dense CSS can put a whole interface on one physical line.

For a reproducible snapshot, record:

- Included files and commit, plus byte and physical-line counts.
- Vendor libraries, archived duplicates, generated files, and fixtures kept separate.
- A formatting-resistant text measure if useful, with its exact definition.
- Assumed manual production rates, labeled as scenario inputs rather than industry facts.

This example uses **80 non-whitespace characters as one source-text unit**. That is a volume measure, not a semantic line of code. It includes the selected source’s templates and data strings. It does not prove who wrote a line or how hard it was.

A source/rate calculation estimates a slice of implementation work. **Do not add it to an overall feature budget that already includes implementation.** Use it to ask whether the budget has room for the code, then explain the remaining design, learning, integration, verification, and debugging assumptions.

## Machine speed and human gain are different

The [expansion mental model](ROBOT_EXPANSION_MENTAL_MODEL.md) works through human typing bandwidth, AI emission, duty cycles, useful-output yield, and independent workers. It includes editable inputs and a local calculator, with an explicit bridge from capacity to effort-saved blocks.

If timestamps exist, assistant request-to-completion windows can provide another descriptive measure. Those windows include tools, browser checks, latency, and revisions. They are not pure inference time, and they can overlap a person’s review or other activity.

A project’s retained source divided by those windows is an artifact-throughput proxy. It is not a typing-speed benchmark, not a count of all generated/rejected code, and not the same as W/H. A shorter machine run does not erase the human judgment that made its output useful.

The larger gain may come from being able to try several visual directions, discover a browser problem, and retain a working alternative quickly. Describe that possibility; do not turn every discarded experiment into another guaranteed hour saved.

## Stack and show it

Keep human inputs solid and visible. Let robot expansion be translucent, so rotation can reveal the human input inside. Fill supported layers from the bottom back corner, then across a layer, then upward. Link each expansion to the human contribution it follows. Gifts can arrive later as their own events.

Offer combined and separated groups. Label **human blocks**, **estimated effort saved**, and **gifted resources** independently. A whole-project multiplier is an average; individual entries may have very different expansion.

The current Types slider supports up to **30× robot expansion**. This is an interface limit, not the upper bound of an estimate. The worked journal’s high scenario exceeds that control; the documents record it without changing or clamping the prototype UI.

Additional collaboration can be recognized without inventing new robot expansion. When the same review would be needed in the manual comparison, add it equally to H and W: R stays unchanged. The [team update](ROBOT_VALUE_BLOCKS.md) applies that rule to Lindsay’s six daily blocks.

## Value arithmetic

```text
human reference value = 100 × H
robot effort-saved equivalent = 100 × R
combined reference equivalent = 100 × (H + R), plus separately recorded gifts
```

The robot reference amount is neither cash received nor another human’s contributed hours. Robot blocks do not receive money or create Gratitude money. Gifts remain a separate type; do not invent a zero gift balance when no giving ledger has been reconciled. Any displayed whole-project total should show which parts are estimated and which are recorded.

## A reusable estimation brief

```text
Read the human ledger and freeze the delivered scope at a named milestone.
Inventory original project artifacts without counting dependencies or archive
copies as new code. Build fast, working, and deep no-AI workload budgets for
this contributor and this result, with learning and testing scoped explicitly.

Use H from the human ledger. Calculate additional robot blocks as max(0,W-H),
robot expansion as R/H, and gross output gain as W/H. Explain any rate inputs,
include a human-hours sensitivity check, and separate measured facts from
judgment calls. Do not use external productivity studies or a desired multiplier
as evidence. Save a draft now with enough arithmetic to update it later.
```
