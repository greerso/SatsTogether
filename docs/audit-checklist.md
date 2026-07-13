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
- [x] `docs/internal-security-review-2026-07-13.md` — **Claude internal review (2026-07-13)**; NOT a substitute for external audit  
- [ ] External audit engagement — **DEFERRED (zero budget)**; still required for P3 exit  
- [ ] Funded bug bounty  
- [ ] Legal counsel review of prize-linked framing  

**Paid external audit: DEFERRED (zero budget).** As a partial, honest
stopgap a Claude internal security review was completed **2026-07-13**
(`docs/internal-security-review-2026-07-13.md`): 2 memory-DoS issues fixed,
6 open (draw manipulability, XFF-trust rate-limit bypass, others). This is an
internal model review, **not** an external or paid audit, and **P3 exit remains
unmet** — a real external audit + funded bounty are still mandatory.

## Auditor sign-off

**Required before:** lifting any TVL cap, mainnet principal custody, or marketing principal protection as enforced.

Auditor sign-off: **not obtained**.
