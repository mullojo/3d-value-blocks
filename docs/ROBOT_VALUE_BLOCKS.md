# Robot value blocks · The Value Blocks experiment

**Working picture: 21 human blocks + 629 robot blocks = 650 equivalent blocks.** About **31× total-output gain**, or **30× additional robot expansion** per human input block.

This is a project-specific draft prepared November 22, 2026, through `5570a3d`. It asks what it might have taken Bob, a skilled developer, to produce this same visual playground without generative AI. It is a workload model, not measured hours saved. The upper scenario makes room for the very large gains Bob described; it is not a proven 100× benchmark.

The [human journal](HUMAN_VALUE_BLOCKS.md) independently allocates **21 human blocks / $2,100**. The [starter guide](ROBOT_VALUE_BLOCKS_GUIDE.md) defines the ratios and method. This model recognizes the human’s ideas and judgment; it does not suggest that the AI independently invented the contribution system.

## What is actually in the artifact?

| Snapshot evidence | Amount |
| --- | ---: |
| Original selected source files | 39 |
| Runtime JS / CSS / HTML | 22 files |
| Standalone check suites at this snapshot | 13 files |
| QR/gallery/check tooling | 4 files |
| Selected UTF-8 source bytes | 442,644 |
| Physical source lines | 3,599 |
| Nonblank source lines | 3,533 |
| Non-whitespace Unicode characters | 405,076 |
| 80-character source-text units | 5,063.45 |
| Preserved design captures | 43 |
| Completed chat turns reviewed | 49 |

The count includes Vue templates, CSS, example strings, test fixtures, and generated gallery-card markup in the selected files. It excludes vendor libraries, three archived copies, portraits/screenshots, generated SVGs, JSON data, Markdown, and the new records being prepared now. It describes the retained artifact, not how many lines the AI personally authored or all the revisions it generated. Dense formatting makes physical LOC particularly unhelpful here.

See the exact [source inventory](value-block-records/source-inventory.json) and [chat timing evidence](value-block-records/chat-evidence.json). With Git installed and the snapshot commit available locally, reproduce the source inventory with:

```sh
node scripts/inventory-source.cjs 5570a3d
```

The delivered scope includes CSS materials, a WebGL2 path up to 100,000 blocks, paced preparation/arrivals, real-calendar geometry, several journal layouts, interactive film credits and finale, local input CRUD, parsing/capacity rules, project palettes, type filtering and arithmetic, embedded-Bitcoin designs, documentation, and a gallery. It is a functioning visual prototype, not a finished financial platform.

## Build a comparable result without generative AI

All paths assume an ordinary skilled developer can still use Vue, Tailwind, QR libraries, documentation, search, browser developer tools, automated tests, and familiar software. There is no budget for writing those dependencies from scratch.

- **Fast path:** the relevant techniques are largely familiar, choices land quickly, and few experiments are discarded.
- **Working path:** some WebGL/CSS 3D learning, meaningful visual iteration, and normal integration/debugging are required.
- **Deep path:** substantial unfamiliar 3D/rendering work, learning, browser investigation, and iteration are required. The result has the same scope; the workflow is harder, not a silently larger production build.

These budgets are explicit judgments about this project. They were not measured in a parallel no-AI build, and no productivity studies or generic “human coding speed” claims are used. They can be edited lane by lane.

| Work area | Fast hours | Working hours | Deep hours |
| --- | ---: | ---: | ---: |
| Cube materials and count interactions | 15 | 35 | 90 |
| GPU scale and paced construction | 45 | 125 | 420 |
| Calendars, labels and cameras | 25 | 75 | 250 |
| Journal layouts and contribution stories | 20 | 55 | 170 |
| Interactive credits, finale and QR | 15 | 55 | 160 |
| Input workflows and data rules | 35 | 100 | 260 |
| Types, linked expansion and filters | 25 | 85 | 270 |
| Embedded-Bitcoin visual variants | 15 | 45 | 160 |
| Shared verification and release checks | 15 | 40 | 150 |
| Public docs, gallery and repository setup | 15 | 35 | 120 |
| **Total manual-equivalent workload W** | **225** | **650** | **2,050** |

Each feature lane includes its design, learning, implementation, and local troubleshooting. Shared verification covers the separate cross-module harness, integration, and release checks; it does not add a second fee for the same feature debugging. The machine-readable [lane notes](value-block-records/ledger.json) specify each budget’s scope. Archives are preserved outputs, not three more independently implemented apps.

The working path is about 16 full 40-hour weeks; the deep path is about 51. These are counterfactual workloads, not a claim that Bob actually spent those weeks or that every specialist would need them. The GPU/3D learning and the cost of finding and polishing many visual alternatives make the biggest difference between the paths.

## Turn the workloads into blocks

Use **R = W − H**, with H = 21. Robot blocks show the additional effort equivalent; the human remains in the stack.

| Scenario | Human input H | Manual equivalent W | Robot blocks R | Additional robot expansion R/H | Gross total-output gain W/H |
| --- | ---: | ---: | ---: | ---: | ---: |
| Fast | 21 | 225 h | 204 | 9.7× | 10.7× |
| Working | 21 | 650 h | 629 | 30.0× | 31.0× |
| Deep | 21 | 2,050 h | 2,029 | 96.6× | 97.6× |

That gives a scenario range of roughly **11×–98× gross output**, with **31×** as the working estimate. It puts numbers around the contributor’s 10×–100× intuition without claiming that intuition itself is evidence of a measured speedup. The central 650-hour budget stands on the lane estimates above; changing those changes the result.

### Follow the expansion through the work periods

Shared verification is allocated once across the same periods as the human journal. These are workload-derived expansions, not six independently observed productivity experiments.

| Work period | Human blocks | Working manual equivalent | Working robot blocks | Robot expansion |
| --- | ---: | ---: | ---: | ---: |
| 2026-11-04 | 4 | 170 h | 166 | 41.5× |
| 2026-11-13–2026-11-16 | 4 | 82 h | 78 | 19.5× |
| 2026-11-17 | 2 | 115 h | 113 | 56.5× |
| 2026-11-18 | 4 | 108 h | 104 | 26.0× |
| 2026-11-20–2026-11-21 | 5 | 138 h | 133 | 26.6× |
| 2026-11-22 | 2 | 37 h | 35 | 17.5× |
| **Total** | **21** | **650 h** | **629** | **30.0× average** |

The 30.0× average is rounded: 629 / 21 ≈ 29.952. Setting the prototype’s whole-number multiplier to exactly 30× would show 630 robot blocks—one more than this workload model. Keep that rounding difference visible rather than changing the human record to make the display fit.

## A source-volume rate cross-check

For a complementary character-rate model, see [Robot expansion: from human bandwidth to a larger field of work](ROBOT_EXPANSION_MENTAL_MODEL.md). Its 70× raw / 700× availability example uses different assumptions and units from the project-specific budgets here; it does not revise this ledger.

Take 5,063.45 retained source-text units and try three assumed manual net production rates. These are knobs for reasoning, not measured industry rates. They concern already-scoped source production, not the full design/research/debugging loop.

| Assumed manual text units/hour | Source-production hours |
| ---: | ---: |
| 100 | 50.6 |
| 50 | 101.3 |
| 25 | 202.5 |

The working 650-hour budget therefore has room for about 101 hours of source production plus roughly 549 hours of design, research/ramp-up, integration, visual iteration, debugging, verification, and documentation under this particular model. That remainder is an assumption to challenge, not a fact established by the code count. This cross-check is **inside** the workload budget; it is not added again.

Across the 49 completed turns, the sum of request-to-assistant-completion windows is about **5.34 hours**. Dividing the retained source volume by those windows gives roughly **948 source-text units per turnaround hour**. Compared with the illustrative 25–100-unit manual rates, that is about **9.5×–38× artifact throughput**. It is a descriptive second lens, not pure machine coding speed: those windows include tools, checks, latency, and noncoding work, while the retained snapshot includes templates and data. It also omits rejected code and cannot establish individual authorship.

Do not replace H with that 5.34-hour assistant figure to advertise a larger human gain. The human journal’s 21 blocks and the assistant’s turnaround windows answer different questions and can overlap.

## What if the human estimate moves?

Hold the working manual budget at 650 hours and change only the draft human input:

| Human input | Robot effort saved | Gross gain |
| ---: | ---: | ---: |
| 16 h | 634 blocks | 40.6× |
| 21 h | 629 blocks | 31.0× |
| 28 h | 622 blocks | 23.2× |

The working estimate remains about 23×–41× across that human-attention range. Workload uncertainty is larger: someone already expert in the techniques could need fewer than 225 hours, and a difficult solo learning path could exceed 2,050. The three scenarios are planning judgments, not statistical confidence limits or guaranteed lower/upper bounds.

## A value picture, without losing the people

| Working scenario | Blocks | $100 reference equivalent |
| --- | ---: | ---: |
| Human contribution recognized | 21 | $2,100 |
| Estimated additional robot effort saved | 629 | $62,900 |
| Combined equivalent | 650 | $65,000 |
| Gifts received | Not reconciled | Not included |

The $62,900 is an effort-saved reference equivalent, not market revenue, a cash gift, or extra human hours actually worked. Robot blocks are not recipients of money and are not Gratitude issuance sources. Appreciation fill multipliers are different controls again and do not increase these hours.

## How to improve this next

Bob can adjust the human allocation, mark which techniques were already familiar, and revise individual manual lanes. A short comparable manual task would help calibrate the source-rate assumptions. Record revisions with their reason and keep this original draft available.

Confidence is strongest in the artifact inventory and work sequence, more approximate in the human allocation, and most dependent on judgment in the no-AI counterfactual. That still makes a useful first picture: a modest stack of human attention, with a much larger translucent field of work around it.
