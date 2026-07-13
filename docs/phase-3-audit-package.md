# Phase 3 — Security readiness package (prep)

**Status:** Phase 3 **prep** only. No external audit has been commissioned. No bug
bounty is funded. This package exists so a future auditor/reviewer can see
exactly what is real vs design vs mock.

**Related:** `docs/audit-checklist.md`, `docs/bitvm-challenge-game.md`,
`docs/bug-bounty-scope.md`, `docs/protocol-spec.md`, `docs/threat-model.md`.

---

## 1. What is implemented today (in scope for review as prototype)

| Component | Path | Reality |
|-----------|------|---------|
| Draw selection model | `sim/draw.ts`, `bitvm/draw_verifier.rs` | Offline, `placeholder_mix` (not SHA-256) |
| Share ledger | `sim/ledger.ts` | Off-chain sim; claims are ledger credits only |
| Testnet hashes | `testnet/*` | Real testnet/signet tip hashes via public explorers |
| Web prototype | `web/*` | Ephemeral sessions; Coolify HTTPS |
| Governance tally | `governance/voting.ts` | MockSigner only; not sybil-resistant |
| Yield rotator | `yield-adapters/*` | MockBitVMVerifier only |
| Interfaces | `Signer`, `YieldProofVerifier` | Drop-in points for real impls |

## 2. Explicitly out of scope (do not audit as production)

- BitVM2 circuits / fraud proofs / slashing bonds  
- Principal covenant vaults  
- Lightning custody / real prize delivery  
- BIP-322 signing (interface stub only — `governance/bip322-signer.ts`)  
- Mainnet deploy paths (`scripts/deploy-mainnet.sh` refuses)  
- Sybil-resistant quadratic voting  

## 3. Recommended audit order (when funded)

1. **Protocol consistency** — `docs/protocol-spec.md` vs `sim/*` vs web API  
2. **Draw fairness assumptions** — commit-reveal, seed grinding, explorer trust  
3. **Session / web threat model** — XSS, DoS caps, cookie security (post-#19)  
4. **Interface boundaries** — what production must replace (`Mock*`)  
5. **BitVM challenge game design** — `docs/bitvm-challenge-game.md` (design-only until circuits exist)  

## 4. Phase 3 exit criteria (honest status)

| Criterion | Status |
|-----------|--------|
| Audit report(s) with criticals fixed | **Not started** — no engagement |
| Audit checklist done or deferred with reason | **Mapped** in `docs/audit-checklist.md` |
| Legal framing reviewed for jurisdictions | **Not reviewed** — framing only (`docs/legal-framing.md`) |
| Real message signing (BIP-322) | **Stub only** — not production crypto |
| Challenge game specified | **Design draft** — not implemented |
| Bug bounty funded | **Scope draft only** — no wallet funded |

## 5. How to run the prototype for reviewers

```bash
git clone https://github.com/greerso/SatsTogether
cd SatsTogether
export PATH="$HOME/.cargo/bin:$PATH"
./scripts/smoke-test.sh
npm run testnet:draw -- --shares 1000 --winners 5
npm run web   # http://localhost:3000
```

Live: https://satstogether.greerso.com (ephemeral; not a security boundary).

## 6. Non-goals until P3 exit criteria are real

- Marketing “audited” or “no-loss guaranteed”  
- Mainnet TVL  
- Claiming BitVM2 security for `placeholder_mix`  
