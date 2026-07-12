# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`

## Done
- Phase 0–1 complete (spec human-reviewed)
- Phase 2 slice: `testnet/` + `npm run testnet:draw` + runbook in `docs/testnet-guide.md`

## Next
1. Optional second-person live testnet check
2. Phase 3 only after deliberate audit scope — do not overclaim P2

## Workflow
- Always: commit → PR → code-review → fix → squash-merge
- Local gate: `export PATH="$HOME/.cargo/bin:$PATH" && ./scripts/smoke-test.sh`
- Live soft: `./scripts/testnet-check.sh`
- End of turn: always suggest next step
