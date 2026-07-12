# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`

## Done
- Phase 0 + Phase 1 sim on main
- Opus critical-assessment of `docs/protocol-spec.md` → `.hybrid/protocol-spec-critical-assessment.md`
- Follow-up branch: fix QV honesty, first-valid, burn concentration, error catalog, attempt-budget parity

## Next
1. Human accept remaining P1 “spec reviewed” (after this PR lands)
2. Phase 2: testnet block-hash → draw inputs

## Workflow
- Always: commit → PR → code-review → fix → squash-merge
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
- End of turn: always suggest next step
