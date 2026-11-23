# Robot expansion · From human bandwidth to a larger field of work

**A useful starting picture: about 70× raw text output, and 700× equal-window capacity when a human types for 10% of the window and AI generates throughout it.** Both follow from the assumptions below. Turning that capacity into robot value blocks takes one more step: estimate useful human effort saved on a comparable result.

This is an editable reference model, prepared November 22, 2026 from a contributor-supplied discussion, with the arithmetic and interpretation reviewed here. Its rates are scenario inputs, not measured averages for developers or a benchmark of a named frontier model. It replaces no existing contribution allocation.

## 1. Start with the physical bandwidth

| Input | Starting assumption | Meaning |
| --- | ---: | --- |
| Human typing | 60 words/minute | A deliberately brisk sustained typing scenario |
| Word convention | 5 characters | Converts WPM to a character rate |
| Human raw rate | 5 characters/second | 60 × 5 ÷ 60 |
| AI stream | 100 tokens/second | An illustrative generation rate to edit or measure |
| Characters per token | 3.5 | A text-dependent approximation |
| AI raw rate | 350 characters/second | 100 × 3.5 |
| Code density | 35 characters/line | Includes whitespace/newlines on average; purely illustrative |

```text
human rate = WPM × characters_per_word / 60
AI rate = tokens_per_second × characters_per_token
raw emission ratio = AI rate / human rate = 350 / 5 = 70×
```

At 130 tokens/second and the same 3.5 characters/token, the AI rate would be **455 characters/second**, or **91×**. The pasted discussion’s “70×–100×” range was a loose approximation; those particular endpoints produce 70×–91×. A 100× raw ratio requires 500 characters/second against this human rate.

Token counts, Unicode characters, and file bytes are different units. The file sizes below assume approximately ASCII text, one byte per character. Emoji and other Unicode content change the byte count. Formatting can also change the number of lines without changing the behavior.

## 2. Scale the amount, keeping the ratio fixed

These are emission-only calculations: all of the illustrative text is typed or generated continuously, with no extra thinking, review, tools, or retries added.

| Illustrative lines | Characters / ASCII bytes | Approximate file size | Human at 5 chars/s | AI at 350 chars/s |
| ---: | ---: | ---: | ---: | ---: |
| 1,000 | 35,000 | 34.2 KiB | 1.94 hours | 1.67 minutes |
| 10,000 | 350,000 | 341.8 KiB | 19.44 hours | 16.67 minutes |
| 100,000 | 3,500,000 | 3.34 MiB | 194.44 hours | 2.78 hours |
| 1,000,000 | 35,000,000 | 33.38 MiB | 1,944.44 hours | 27.78 hours |

The exact unrounded ratio is **70× at every size**. More lines increase both durations proportionally. One million lines here corresponds to about 243 eight-hour typing days; calling that a “work year” is an approximate calendar analogy, not a measured project estimate.

The counterfactual assumes those characters needed manual entry. Human developers can also reuse libraries, copy code, expand snippets, and generate boilerplate. Compare equivalent workflows when applying the model to a real project.

## 3. Add availability, with an explicit clock

Let `dH` and `dAI` be the fractions of the **same elapsed-time window** spent typing or generating.

```text
equal-window emission capacity ratio = raw ratio × dAI / dH
                                    = 70 × 1 / 0.1
                                    = 700×
```

A human at 10% of a 24-hour day types for 2.4 hours/day. AI at 100% generates for 24 hours/day. Under those assumptions:

| Lines | Human calendar days at 2.4 typing h/day | AI continuous emission |
| ---: | ---: | ---: |
| 1,000 | 0.81 days | 1.67 minutes |
| 10,000 | 8.10 days | 16.67 minutes |
| 100,000 | 81.02 days | 2.78 hours |
| 1,000,000 | 810.19 days | 27.78 hours |

**700× is mathematically correct for this equal-window capacity scenario.** It assumes continuing independent AI work, with no added queue, review wait, or integration delay. It does not establish 700× finished-project speed or 700 robot blocks for each human block.

An eight-hour-workday interpretation changes the schedule. Ten percent is 48 minutes of typing per workday. Comparing that with eight hours of AI generation per workday again gives 700×. Comparing those 48 minutes with **24 hours** of AI generation gives **2,100×** before weekends or other constraints. Specify the clock rather than mixing the schedules.

Sleep and rest explain calendar availability. They do not become extra human effort saved. For the million-line example, the raw typing requirement stays 1,944 hours even when it occupies 19,444 elapsed hours at a 10% calendar duty.

If the other 90% is spent designing, reading, debugging, or reviewing the same project, that time can be real human contribution. Estimate it as such, rather than treating it as lost availability or automatically adding it again to a workload budget that already includes engineering.

## 4. Let useful output, autonomy, and parallel work enter the picture

A richer capacity sketch is:

```text
F = (AI raw rate / human raw rate)
    × (AI generating duty / human typing duty)
    × (AI useful-output yield / human useful-output yield)
    × effective independent AI workers
```

“Useful-output yield” means output that contributes to the agreed result. It is a rough retention/acceptance factor; character counts alone cannot assess correctness or the value of a design. Effective workers account for actual independent progress after contention and integration, not simply the number of agent windows opened.

| Change from the starting scenario | Capacity ratio |
| --- | ---: |
| Both emit continuously; equal yields; one worker | 70× |
| Human emits 10%; AI emits continuously | 700× |
| Human emits 10%; AI emits 50% | 350× |
| Human emits 10%; AI emits 10% | 70× |
| Human emits 10%; AI continuous, retaining 25% as much useful output per emitted character | 175× |

Several independent workers can raise capacity. Shared files, dependencies, and human review can make effective parallelism much smaller than the worker count. These are levers to inspect, rather than a single permanent “AI gain” number.

The interesting frontier is how much of the loop the system can carry: understand the task, research, implement, run checks, diagnose a failure, revise, compare a visual result, and keep going. Our project history already includes those kinds of tool-assisted loops. Greater continuity and better verification can increase useful capacity while reducing the human attention required per accepted result.

## 5. Look for the part that still waits

For a fixed workload, one simple bottleneck model uses a fraction `s` that still takes its original time, while the rest accelerates by `F`:

```text
whole-workload wall-time gain = 1 / (s + (1 − s) / F)
```

With F = 700, a remaining unchanged fraction of 10% gives about 9.9× wall-time gain; 1% gives about 87.6×. These are illustrative fractions, not claims about a typical project or a universal 10× ceiling. If the system also helps with the formerly slow work, `s` changes. Exploring more scope or better designs also changes the workload.

Human review can be a valuable bottleneck. Test coverage, smaller reviewable batches, good instructions, reusable tools, and reliable autonomous checks help a collaborator spend attention on decisions rather than inspecting every emitted character. Count the effort required to establish those tools when estimating a real project.

## 6. Convert a comparable result into robot blocks

Use a separate effort estimate to connect this model to the journals:

```text
H = human hours actually contributed or reasonably estimated
W = human work hours to achieve the comparable result without AI
R = max(0, W − H)                    additional robot effort-saved blocks
robot expansion = R / H             for H > 0
gross output per human input = W / H
```

Hours in W describe active effort, including appropriate design and debugging. Hours spent asleep, waiting overnight, or away from the project do not inflate W. Where H and W are approximate, the resulting multiplier is approximate too.

The original Bob-only example is **H = 21**, **W = 650**, and **R = 629**: about **30× additional robot expansion** and **31× total-output gain**. The new 70×/700× capacity model is another lens for reasoning about that estimate. It does not independently replace W, revalue the source inventory, or multiply the recorded blocks by 700.

The later team update adds Lindsay’s six daily review blocks to both human input and the comparable manual workload: **H = 27**, **W = 656**, and the same **R = 629**. That is about **24.3× total output** per combined human input. The additional recognition does not automatically create additional robot blocks.

A collaborator can have low human-attention cost even when an AI job takes many machine hours. Conversely, a fast stream can demand substantial review. Track **human input**, **machine/calendar duration**, and **accepted result** separately. This is how very large expansion can be explored without losing its meaning.

## 7. Use and revise this reference

1. Set the result and quality bar: the same useful prototype or system on both sides.
2. Enter or measure text rates; keep assumptions labeled until measured. Include the model/service/date and whether a rate includes tool time when benchmarking.
3. Pick an explicit clock and availability fractions. State what occupies the human’s non-typing time.
4. Record useful-output yield, supervision, and actual parallel independence.
5. Build W from the work areas, learning, iteration, verification, and reuse appropriate to that person.
6. Keep H grounded in the human journal; calculate R from W and H.
7. Retain the previous draft and explain any new measurement or changed assumption before revising a project allocation.

Editable inputs: [expansion-capacity-model.json](value-block-records/expansion-capacity-model.json). Recalculate with Node, using only local files:

```sh
node scripts/robot-expansion-capacity.cjs
# Or supply your own input file:
node scripts/robot-expansion-capacity.cjs path/to/scenario.json
```

The calculator reports raw and equal-window rates, emission times, calendar days, and the separate scheduled-workday interpretation. Its starting yields and effective worker count are 1. It excludes further engineering/review/tool overhead unless those effects are represented in the supplied inputs. Recalculate the tables if those inputs change; this document records the original 60 WPM / 350 chars/s scenario.

For application to the project, see the [robot guide](ROBOT_VALUE_BLOCKS_GUIDE.md), [robot estimate](ROBOT_VALUE_BLOCKS.md), and [human journal](HUMAN_VALUE_BLOCKS.md). No new human or robot blocks are allocated by this reference document.
