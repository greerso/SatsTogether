# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`

## Done
- Phase 0 + Phase 1 complete on main (spec human-reviewed 2026-07-12)
- Opus critical-assessment + follow-ups merged

## Next
1. Phase 2: testnet block-hash → draw inputs vertical slice
2. Update `docs/testnet-guide.md` runbook for that slice

## Workflow
- Always: commit → PR → code-review → fix → squash-merge
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
- End of turn: always suggest next step
