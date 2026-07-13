# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Live: https://satstogether.greerso.com (Coolify `ewfwbpp6c6iit5e2noaj4gd9`)
- Remote: public `greerso/SatsTogether`

## Phase status
- **P0–P2 complete** (offline + testnet hash→draw + web)
- **P3 prep** landed: audit package, challenge-game design, bounty scope draft, Bip322Signer stub, GH Actions smoke
- **P3 exit NOT met** (no external audit, no funded bounty, no legal sign-off)

## Next
1. Human: engage auditor with `docs/phase-3-audit-package.md`
2. Implement real BIP-322 or drop QV path after review
3. Circuit work only after challenge-game freeze checklist
4. Do not mainnet

## Verify
```bash
export PATH="$HOME/.cargo/bin:$PATH"
./scripts/smoke-test.sh
curl -s https://satstogether.greerso.com/health
```
