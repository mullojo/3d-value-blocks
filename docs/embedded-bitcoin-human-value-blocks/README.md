# Embedded Bitcoin Human Value Blocks

Draft concept summary · November 20, 2026

Source: project design discussions and the creator’s clarifications, summarized here so no private chat access is required. This is a record of proposed ideas, not an implemented protocol.

An **Embedded Bitcoin Human Value Block** is an optional form of human value block: it recognizes a real contribution, may qualify to create Gratitude money, and contains Bitcoin that the block’s owner can later unlock by retiring Gratitude.

## Human contribution and peer approval come first

A person records work, care, or another qualifying contribution. The block still requires human peer approval and remains subject to a global limit of **27 human value blocks per person per day**. Self-funding a block’s Bitcoin does not permit self-approval. Good / non-harmful contributions and other future criteria remain part of the draft protocol.

## Two alternative economic conditions

Alongside peer approval, the block can satisfy either condition:

- A peer contributes **10 `<G>`**, which is **burned**.
- Approximately **$10 worth of Bitcoin is embedded at creation**.

Bitcoin replaces the requirement for the additional 10 `<G>` contribution. It **does not replace peer approval**.

An approved, qualifying human block can mint **100 `<G>`**. The recognized human contribution remains the issuance source. Bitcoin is an existing resource associated with the block, not a separate source of new currency issuance.

## Three sources of embedded Bitcoin

1. **Self-sponsored:** the person recording the contribution supplies the Bitcoin.
2. **Personally sponsored:** someone supports another person’s contribution, even if the initial gift is much less than the value of their work.
3. **Community sponsored:** many people fund a pool that sponsors contributions.

Sponsor contributions are **irrevocable gifts**. The sponsor has no right to take the gift back. In this special block’s reserve flow, future redemption belongs to the block’s owner/controller; this is distinct from other giver-managed giving concepts explored elsewhere in the playground.

## Future owner redemption

The block’s owner/controller can give **any 100 `<G>`** to that block and burn those units to unlock its embedded Bitcoin. These need not be the original units minted by the block.

The reserve is the Bitcoin amount originally embedded. Its future dollar value can change; “$10” describes its approximate value at creation.

**Human contribution → embedded BTC + peer approval → +100 `<G>` minted → owner later burns 100 `<G>` → BTC unlocked**

## Supply arithmetic and boundaries

The ordinary route burns 10 `<G>` and mints 100, a **net increase of 90 units** at that step. The Bitcoin alternative does not require that initial 10-unit burn. A later successful Bitcoin redemption retires 100 `<G>`.

These are unit movements, not a fixed exchange rate between Bitcoin, dollars, and Gratitude. The embedded reserve is not a claim that $10 of Bitcoin fully backs a fixed $100 redemption obligation.

This remains a **human block with an embedded-Bitcoin feature**, not a fourth base contribution type. A sponsor’s resources can enable the feature, but gift blocks and robot estimates do not become new-money issuance sources.

## Confirmed ideas versus proposals

The creator explicitly confirmed continued peer approval, the global daily limit, the economic OR condition, the 10 `<G>` burn in the ordinary route, and irrevocable gifts. Their original proposal established owner-controlled redemption through a later 100 `<G>` burn.

The linked assistant also proposed retaining the historical contribution after redemption and preventing duplicate minting if both economic conditions are met. These remain useful design proposals, rather than additional confirmed rules. The playground’s release preview keeps the contribution visible as an exploration of that proposal.

Cryptographic enforcement, custody, recovery, peer-network operation, and the remaining eligibility rules are future protocol work. Layer-2 cryptographic approaches were discussed as a longer-term direction; no particular implementation has been selected here.

## Playground treatment

The Types page’s **Special blocks** section explores an orange Bitcoin coin inside a human-value cube. Source choices and an owner-release preview illustrate the human experience. They do not create keys, hold funds, approve contributions, mint Gratitude, or perform transfers. Protocol details belong in this document rather than in the primary visual flow.

### Numbered visual variants

The Special blocks explorer includes stable concept numbers for comparison:

1. **Porthole:** the original solid human cube with a circular window.
2. **Crystal:** a human-colored glass shell with a dimensional coin inside and no exterior stamps.
3. **Coin recess:** a deep rim and a smaller coin seated inside the face.
4. **Value stamp:** an opaque block with Bitcoin and an illustrative 10,000-sat label on two faces. This sample label is not a live conversion of the creation-time $10 example.
5. **Corner signal:** orange Bitcoin marks on three faces and a strong edge signal for compact stacks.

Each design is shown at 56px, 32px, and 20px block-edge sizes and in a 27-block stack. Preview coins use fewer depth slices while retaining front, back, and edge surfaces. These are visual studies of the same optional human-block feature, not new monetary types or protocol rules.
