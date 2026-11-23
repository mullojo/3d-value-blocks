# Recognizing human value with an AI collaborator

A working guide for a more visible kind of project journal. The human brings intention, taste, lived experience, questions, persistence, and decisions. AI can help turn that attention into a surprising amount of working material. Both are worth seeing clearly.

**One human value block is about one hour of human contribution. Its starting recognition value is $100.** Record what someone gave, even when they did not type the resulting code themselves.

The [Value Blocks human journal](HUMAN_VALUE_BLOCKS.md) is a real worked example of this method. The [robot guide](ROBOT_VALUE_BLOCKS_GUIDE.md) adds a separate way to explore the work AI helped expand.

## What belongs in a human block?

Recognize the human’s part in discovering and making the result:

- Imagined the experience, chose a direction, or explained the domain.
- Brought examples, screenshots, prior experiments, or useful constraints.
- Reviewed a result, noticed a problem, and made the next design decision.
- Tested the interface or reported what happened while using it.
- Guided implementation, compared alternatives, or stayed actively involved in troubleshooting.
- Wrote, organized, documented, published, or helped others use the work.

A useful prompt can carry years of experience. That experience matters without turning every good sentence into another hour. Recognize the whole contribution period first, then describe its parts.

Keep the assistant’s unattended work and the hypothetical time needed to rebuild the project in their own columns. Neither becomes extra human hours merely because the computer was busy.

## Make a first draft

1. **Find the last recorded boundary.** If there is already a ledger, identify the work it includes. A repeated review of the same scope adds no new blocks.
2. **Read the actual story.** Use the available chat, project artifacts, screenshots, contributor reports, and Git history. An initial commit often imports days of earlier work. Chat timestamps establish sequence; they are not a time tracker.
3. **Group work into useful periods.** A focused session, day, or clearly labeled multi-day period works. Preserve the contributor’s local dates. Do not invent a precise daily split for a retrospective multi-day estimate.
4. **Estimate the human attention given.** Include the visible thinking, review, testing, and decisions. Use reported hours when available. Otherwise make a rounded scope estimate and give a short explanation or range. Round the period’s chosen estimate once, rather than rounding each small task into a new hour.
5. **Write entries as things that happened.** “Shaped the calendar layouts,” “noticed the animation stalls,” or “published the gallery” reads better than a feature headline. One row can recognize several blocks, all in the same color.
6. **Save it as a draft.** Contributor review can come after there is something concrete to read. An estimate is useful without pretending it is a stopwatch reading.

For daily human records, keep the shared ceiling of **27 blocks per person per day**, across every frame and project. A multi-day summary is a summary, not permission to quietly assign all its hours to one date. A life journal can include project work; these project records are one part of a person’s life, not all of it.

## Give the entries some life

Use one colored square for each whole block and add an explicit count and value. Color describes the entry or category; do not rainbow-fill an individual entry.

Example only:

🟧🟧 Shaped the calendar controls and made the dates easier to explore. 📆✨ — **2 human blocks · $200**

🟥 Found a loading stall and helped choose a smoother build rhythm. ⚡ — **1 human block · $100**

Those entries describe three blocks, about three hours, and $300 of base human value. Brief descriptions are welcome: “washed dishes,” “made pancakes,” or “coded the new controls.” Give enough detail to recognize the moment.

Choose stable category colors for a project. A project can also use one color family with different tones. The goal is a readable record, not a universal color taxonomy.

## Keep one source of totals

Use `docs/HUMAN_VALUE_BLOCKS.md` as the readable journal and `docs/value-block-records/ledger.json` as its structured companion. Useful fields are:

| Field | Why it helps |
| --- | --- |
| Stable period/entry ID | Stops the same contribution being recorded again under a new heading |
| Contributor and work dates | Shows whose attention is recognized and when |
| Short past-tense description | Makes the record feel like work or life actually lived |
| Blocks, color, baseline value | Gives a simple visual and numeric reading |
| Evidence and scope boundary | Makes a future update easy to reconcile |
| Draft / contributor-reviewed / contributor-reported | Describes how the amount was established |

When Bob reports Lindsay’s contribution, the journal identifies it as “reported by Bob.” Contributor-confirmed status identifies the person who actually reviewed that allocation. Both can be recognized without conflating their review histories.

An individual block is an approximate hour; a draft allocation can be adjusted. Once a period has been recorded, append a signed adjustment with the reason instead of silently replacing its history. Keep period rows, category rows, and project totals as different views of the same work, rather than adding them together.

Preparing a journal does not automatically earn another block. Say explicitly whether that work is included. Keep received gifts in a separate record. Recognized effort is not a statement of how much funding remains.

## Hand an AI collaborator this brief

```text
Review this project's accessible chat history and files, and update its human
value-block draft journal. Recognize my direction, examples, design judgment,
active review, testing, implementation oversight, and publishing work.

Use about one hour and $100 of base human value per block. Estimate each new
period as a whole, then allocate its blocks into short, past-tense entries.
Show one colored square per whole block and keep the color uniform per entry.
Use the local dates and actual evidence available. Do not count AI runtime,
idle gaps, or work already covered by the ledger as new human contribution.

Write a concrete draft now; I can review the amounts afterward. Keep previous
allocations and append any later adjustment explicitly. Update the README and
support summary, reconcile the arithmetic, and explain the new scope boundary.
Keep hypothetical effort saved by AI in the separate robot-block model.
Do not publish or push the records without my instruction.
```

## Before finishing

Check that the squares, entry counts, period totals, and $100 values agree. Check that the newest scope stops where the previous one did, links resolve, and summaries match the ledger. A docs-only reconciliation needs arithmetic and link validation; it does not need another unrelated GPU benchmark.

End with the amount recognized, where to read it, what remains a draft, and whether the work has been committed or pushed. Keep the tone human. We are making good work easier to see.
