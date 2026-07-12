# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`
- Branch for this work: `feat/phase-1-sim-interfaces` (from `main` @ `f46ca0f` Phase 0)

## Done
- Phase 0 on main (#2): cargo + npm + smoke green; hybrid pipeline; roadmap
- Phase 1 code on feature branch:
  - `docs/protocol-spec.md` implementation-ready draft
  - `Signer` + `MockSigner`; `YieldProofVerifier` + `MockBitVMVerifier`
  - `sim/draw.ts` + `sim/ledger.ts` + `tests/sim.test.ts` property tests
  - Rotator injects `YieldProofVerifier`
  - Roadmap P1 exit boxes updated (human spec review still open)

## Next
1. Human-review `docs/protocol-spec.md` (last P1 exit criterion)
2. Optional: Rust↔TS golden vectors for `select_winners`
3. Phase 2: testnet block-hash → draw inputs vertical slice
4. PR → review → squash merge when smoke green

## Workflow
- Claude = plan/review; Grok = implement; Hermes = conductor
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
- Prefer feature branches; no force-push main
