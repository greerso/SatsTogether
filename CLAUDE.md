# SatsTogether — Claude Code context

## What this is

Early **prototype / design reference** for a Bitcoin L1-native no-loss prize savings protocol (Taproot Assets + BitVM2 design goals, Lightning-first UI mock).

- **Not audited. Not mainnet-ready. Do not use with real funds.**
- Distinguish **design goals** vs **actually implemented** in every change.
- Core protocol (BitVM2 draws, yield proofs, covenant vaults) is largely design-stage; frontend is a UI mockup.

## Layout

```
schema/           Taproot Assets schema
bitvm/            BitVM2 verifier + draw logic (TS + Rust sketch)
sim/              Phase 1 off-chain draw + share ledger simulator
yield-adapters/   DLC / Ark / BitVM wrappers + rotator
frontend/         React Native UI mock
scripts/          deploy, multisig, smoke, hybrid pipeline
governance/       quadratic voting + Signer interface
tests/            Node TS unit/property tests
docs/             legal, audit checklist, testnet, hybrid workflow, protocol-spec
.hybrid/          local plan/diff/review artifacts (gitignored)
```

## Hybrid coding pipeline (Claude + Grok)

Claude is **architect/critic**. Grok Build is **builder**. Hermes can orchestrate both.

Full steps: `docs/hybrid-workflow.md`  
Stage runner: `scripts/hybrid-pipeline.sh`  
Hermes skill: `claude-grok-pipeline`

| Stage | Who | Rule |
|-------|-----|------|
| Plan | Claude | Builder-ready plan only; no full implement |
| Implement | Grok | Execute plan exactly; no redesign |
| Review | Claude | **Diff only** → Blockers / Issues / Improvements |
| Fix | Grok first | Escalate to Claude only for design/security |

## Coding rules

1. **Honesty over hype** — never claim working mainnet, real principal protection, audits, or live draws unless implemented and verified.
2. **No real-funds paths** without explicit human approval (mainnet deploy scripts must stay refuse-by-default).
3. **Small honest steps** — prefer fixing one subsystem over fake end-to-end protocol.
4. Prefer feature branches; do not force-push `main`.
5. After non-trivial work: critical self-review (correctness, consistency, completeness, risk) before commit.

## Useful checks

```bash
# Phase 0 smoke (Rust + TS unit tests)
./scripts/smoke-test.sh

# Or separately:
cd bitvm && cargo test
npm test   # from repo root
```

## Production path

See `docs/production-roadmap.md`. **Phase 0–1 complete**. **Phase 2 current**: one testnet vertical slice (recommended: block-hash → draw inputs). Production/mainnet is P4+ only after testnet slice and audit gates.

## Related docs

- `README.md` — product overview + status
- `docs/testnet-guide.md`
- `docs/legal-framing.md`
- `docs/audit-checklist.md`
- `docs/hybrid-workflow.md` — Claude/Grok/Hermes workflow
