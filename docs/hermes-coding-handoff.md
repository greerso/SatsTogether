# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Remote: `https://github.com/greerso/SatsTogether.git`
- Live: https://satstogether.greerso.com (Coolify `ewfwbpp6c6iit5e2noaj4gd9`)

## Done
- Phase 0–2 offline + testnet draw slice
- Flow UI + live session ledger
- Overnight: multi-segment deposit top-up, demo walkthrough API/UI, winner→account annotations

## Next
- Optional claim-balance design (still audit sink only)
- GitHub webhook auto-deploy on Coolify
- Pod real mechanics when ready

## Verify
```bash
npm test
./scripts/smoke-test.sh
curl -s https://satstogether.greerso.com/health
```
