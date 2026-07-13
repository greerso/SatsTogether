# Audit Checklist (Pre-Mainnet)

**Honest status (2026-07-12):** This is a **design + prep** checklist.  
**None of the production security items below are satisfied.**  
Mapping columns: **Done** = implemented & verified · **Design** = written only · **Mock** = prototype only · **Deferred** = explicit reason.

| Item | Status | Evidence / reason |
|------|--------|-------------------|
| Schema is immutable and publicly verifiable on Bitcoin L1 | Deferred | No L1 schema deployment; `schema/` is design reference |
| All state transitions enforce principal protection (BitVM2 fraud proofs) | Deferred | No circuits; see `docs/bitvm-challenge-game.md` |
| Yield proofs are real-time and on-chain verifiable | Mock | `MockBitVMVerifier` only |
| Draw logic is MEV-resistant (commit-reveal + multiple hashes) | Mock / Design | Optional web commit; offline mix; design in challenge-game doc |
| Pods and multiple winners are fairly split on-chain | Deferred | Pods UI illustrative; no on-chain pods |
| Covenant migration is client-side only (no central force) | Design | `scripts/covenant-migration.ts` / docs only |
| Quadratic funding/voting is correctly implemented and sybil-resistant | Mock | `MockSigner` + known multi-key sybil; documented in threat-model |
| Embedded wallet is fully non-custodial with user-chosen recovery | Deferred | No embedded wallet product |
| No central operator keys or upgrade keys exist | Design | Stated design goal; no mainnet keys. Web operator can manipulate offline draw |
| All user flows tested by newbies | Partial | Demo walkthrough on Coolify; not formal UX study |

## Phase 3 prep artifacts (this repo)

- [x] `docs/phase-3-audit-package.md` — reviewer package  
- [x] `docs/bitvm-challenge-game.md` — challenge game design draft  
- [x] `docs/bug-bounty-scope.md` — unfunded bounty scope  
- [x] `governance/bip322-signer.ts` — interface stub (throws; not real crypto)  
- [ ] External audit engagement  
- [ ] Funded bug bounty  
- [ ] Legal counsel review of prize-linked framing  

## Auditor sign-off

**Required before:** lifting any TVL cap, mainnet principal custody, or marketing principal protection as enforced.

Auditor sign-off: **not obtained**.
