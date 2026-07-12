# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`
- Active PR: https://github.com/greerso/SatsTogether/pull/3 (`feat/phase-1-sim-interfaces`)

## Done (this PR)
- Phase 1 code: protocol-spec draft, Mock* interfaces, `sim/` + property tests
- Smoke green offline (cargo + npm)
- Review follow-ups: ledger JSDoc/comments, edge tests (empty draw, all-burned yield retain)

## Next
1. Human-review `docs/protocol-spec.md` (last P1 exit criterion)
2. Optional: Rust↔TS golden vectors for `select_winners`
3. Squash-merge PR #3 when review satisfied
4. Phase 2: testnet block-hash → draw inputs vertical slice

## Workflow
- Always: commit → PR → code-review → fix → squash merge
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
- Prefer feature branches; no force-push main
