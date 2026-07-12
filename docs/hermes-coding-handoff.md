# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`
- `main` includes Phase 1 (`#3`)

## Done
- Phase 0 + Phase 1 sim/interfaces on main
- Review follow-ups: prize wording (`allocated`), golden vectors Rust↔TS, partial-burn test, input validation

## Next
1. Human-review `docs/protocol-spec.md` (last P1 exit criterion)
2. Phase 2: testnet block-hash → draw inputs vertical slice

## Workflow
- Always: commit → PR → code-review → fix → squash-merge
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
