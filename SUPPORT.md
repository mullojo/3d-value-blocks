# Support Value Blocks

Value Blocks is an open-source, MIT-licensed New Game economy visual experiment. Bitcoin gifts support continued design, development, documentation, and exploration of ways to recognize human contributions.

## Human contribution already given

The [human contribution journal](docs/HUMAN_VALUE_BLOCKS.md) recognizes **31 human blocks ≈ 31 hours · $3,100 of base human value** through the recorded November 2026 work: Bob’s 21 confirmed and 3 new chat-estimated blocks, plus Lindsay’s 7 review/collaboration blocks reported by Bob. That is a recognition baseline, not an outstanding funding balance; received gifts have not been reconciled here.

A separate [robot expansion model](docs/ROBOT_VALUE_BLOCKS.md) explores the additional effort saved with AI. Its reference value is separate from the human baseline and is not another support request.

## Give with Bitcoin

The project’s current receiving address is:

```text
bc1q5qk0kln078zcky3ylk2axvr69jjrfxewmutwzqcgkvhwhnmtvynsdveyu5
```

<img src="assets/support-bitcoin.svg" width="280" alt="Scan to give Bitcoin to the Value Blocks project">

Copy the address into a Bitcoin wallet, or scan the QR. Its exact payment URI is:

```text
bitcoin:bc1q5qk0kln078zcky3ylk2axvr69jjrfxewmutwzqcgkvhwhnmtvynsdveyu5
```

There is no requested amount or tracking service. Check that your wallet shows the address above before sending. The [public address page](https://mempool.space/address/bc1q5qk0kln078zcky3ylk2axvr69jjrfxewmutwzqcgkvhwhnmtvynsdveyu5) is also the destination of the GitHub Sponsor button; it is an external blockchain explorer, not a hosted checkout. This is a Bitcoin on-chain address, not a Lightning invoice.

Giving is optional. It does not buy a block, confer ownership, promise a return, or establish eligibility for Gratitude issuance or another future protocol. The real project address is separate from fictional film giving and embedded-Bitcoin demonstrations in the playground.

## Maintaining the address and QR

`project-support.json` is the canonical support configuration. The generator uses the locally vendored QR encoder; no remote QR service is involved.

```sh
node scripts/build-support-qr.cjs
node scripts/check.cjs
```

When changing the receiving address, update that configuration, this page, the README, and `.github/FUNDING.yml`; regenerate the QR and run the checks. Verify the new address with the project maintainer and inspect the resulting QR in a wallet before publishing. Never include wallet keys or seed phrases in the repository.

Code, documentation, feedback, and sharing the project are also welcome forms of support. See [CONTRIBUTING.md](CONTRIBUTING.md).
