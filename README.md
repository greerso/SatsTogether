# SatsTogether

**Decentralized Bitcoin-Native No-Loss Prize Savings Protocol**

⚠️ **EARLY PROTOTYPE** — this is an unaudited, non-functional design reference and UI mockup. It does not run, has not been tested, and has not been audited. **DO NOT use with real funds.**

SatsTogether is a fully decentralized, Bitcoin L1-native prize-linked savings protocol. Users deposit BTC, earn yield from BTC-native sources, and win random prizes funded by that yield — without ever risking their principal.

- **No sidechains or L2 consensus** — Pure Bitcoin L1 security via Taproot Assets + BitVM2 (design goal).
- **No central operator** — Fully permissionless and open-source.
- **No-loss guarantee (design goal, not implemented)** — principal-protection vaults do not yet exist.
- **Newbie-friendly** — Optional embedded wallet, one-tap Lightning flows, progressive onboarding.
- **Fair & Democratic** — Dynamic quadratic funding, Pods (shared groups), multiple winners, gamification.

## Key Features (0.1.0-prototype)
None of the below is implemented — these are the design targets this prototype's code and mockups are working toward:

- Deposit BTC → instant SatsShare tokens via Taproot Assets.
- Yield from DLC + Ark + BitVM-secured sources, with BitVM2 proofs (design goal; no real proof generation/verification exists yet).
- Dynamic quadratic funding for the community treasury (small donations amplified).
- Weekly draws using Bitcoin block hashes + commit-reveal for MEV resistance (design goal; no real commit-reveal is implemented — draw logic is a mockup).
- Multiple winners per draw.
- Pods: Create or join shared groups to pool odds and split prizes fairly on-chain.
- Gamification: Savings streaks, badges, and optional "Savings Mode" (yield only, no draws).
- Optional yield contribution to public multisig (for audits, bounties, infrastructure).
- Automatic covenant migration when OP_CTV/OP_CAT activate (stronger on-chain principal vaults).
- Fully optional embedded non-custodial wallet with user-chosen social recovery.
- Light-client indexers (one-click user-runnable or community-hosted).
- Tax report export (CSV of prizes).
- On-chain audit log for every action.

## Tech Stack
- **Assets & Pooling**: Taproot Assets (client-side validated SatsShare tokens).
- **Logic & Verification**: BitVM2 (draws, yield proofs, fraud challenges, covenant migration).
- **Payments**: Lightning Network (default for deposits, withdrawals, claims).
- **Randomness**: Bitcoin block hashes + commit-reveal (MEV-resistant — design goal, not implemented).
- **Governance**: Quadratic voting for yield source selection (Bitcoin-signed messages).
- **Funding**: Dynamic quadratic matching for optional community contributions.

## Project Structure
```
SatsTogether/
├── schema/                 # Taproot Assets schema (public, immutable)
├── bitvm/                  # BitVM2 mock verifier + Rust draw reference model
├── sim/                    # Phase 1 off-chain draw + share ledger simulator
├── yield-adapters/         # Yield rotator (injectable YieldProofVerifier)
├── frontend/               # React Native UI mock (not wired to chain)
├── scripts/                # Deployment (refuse), smoke tests, hybrid pipeline
├── governance/             # Quadratic voting + Signer / MockSigner
├── tests/                  # Node unit + property tests
├── docs/                   # Roadmap, protocol-spec, threat model, legal, etc.
└── README.md
```

## Quick Start (Testnet)
See `docs/testnet-guide.md` for the full step-by-step guide.

## Legal & Safety
This is **intended** as a prize-linked savings tool, not a lottery or gambling product — but that classification is jurisdiction-dependent and has **not** been legally reviewed. See `docs/legal-framing.md`. No KYC. No central operator.

## Income Model (Optional & Decentralized)
- Optional % of yield donated to a public multisig (community-controlled via Bitcoin-signed votes).
- 100% transparent on-chain.
- Funds audits, bug bounties (when funded), and infrastructure.
- Users can set 0% or bypass entirely.

## How to Run Locally
1. Clone this repo.
2. Follow `docs/testnet-guide.md`.
3. Mainnet deployment (with a 10 BTC TVL cap as a design goal) is **not implemented** — see `scripts/deploy-mainnet.sh`, which refuses to run.

## Hybrid Claude + Grok development
Claude Code plans/reviews; Grok Build implements. Hermes can orchestrate both.

```bash
./scripts/hybrid-pipeline.sh status
./scripts/hybrid-pipeline.sh plan "your goal"
./scripts/hybrid-pipeline.sh implement
./scripts/hybrid-pipeline.sh review
```

See `docs/hybrid-workflow.md` and `CLAUDE.md`.

## License
MIT — Fork freely. See `docs/fork-policy.md`.

## Status
- **Early prototype / design stage.** Nothing here has been deployed or audited.
- Core protocol (BitVM2 draws, yield proofs, covenant vaults) is **not implemented** — `bitvm/`, `yield-adapters/`, and `governance/` are design references / mocks, not production security boundaries.
- Frontend is a UI mockup, not a functional client.
- **Phase 0–1 complete**; **Phase 2 slice:** real testnet block hashes → offline draw (`npm run testnet:draw`, web at Coolify). Still **not** mainnet-ready.
- **Production path:** `docs/production-roadmap.md` (P0 → P1 → **P2** → P3 audit → P4 capped mainnet → P5 scale).
- **Hosted prototype:** https://satstogether.greerso.com — interactive sim ledger + testnet draw. See `docs/coolify.md`.
- Mainnet deployment and the TVL cap are unimplemented design goals; audits have not happened and are not scheduled.

Built with ❤️ for Bitcoin. No VCs. No premine. Pure decentralization.

---

*This project was collaboratively designed and implemented with Grok (xAI) based on user requirements for a maximally decentralized Bitcoin-native no-loss prize savings experience.*