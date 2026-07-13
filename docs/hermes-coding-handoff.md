# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Live: https://satstogether.greerso.com (Coolify `ewfwbpp6c6iit5e2noaj4gd9`)
- Remote: public `greerso/SatsTogether`

## Done (recent)
- Flow UI + session ledger + testnet draw
- Top-up segments, demo walkthrough, byAccount, frozen winners
- Claim balances (sim), seed commit-reveal, export/import (#16)

## Next ideas
- Partial withdraw / partial claim amounts
- Real pod mechanics
- Coolify GitHub auto-deploy webhook
- Rate-limit remaining mutating APIs

## Verify
```bash
npm test
curl -s https://satstogether.greerso.com/health
```
