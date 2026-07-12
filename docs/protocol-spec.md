# SatsTogether Protocol Spec (Phase 1 draft)

**Status:** Draft outline for Phase 1. Not implemented. Not auditable as a complete protocol yet.

## 1. Actors

| Actor | Role |
|-------|------|
| Depositor | Locks BTC (design: principal-protected vault); receives SatsShare units |
| Prover | Submits yield / state claims with bonds (BitVM2 design) |
| Challenger | Disputes invalid proofs |
| Draw coordinator | Off-chain selection model today; on-chain commit-reveal design goal |
| Pod member | Optional pooled odds; fair split design goal |

## 2. Assets & state (design)

- **Principal:** BTC under covenant/vault rules (unimplemented).
- **SatsShare:** Client-side validated Taproot Asset units representing pool participation (schema sketch only).
- **Yield pool:** Accrued yield available for prizes / optional QF (mock only today).
- **Liquidity buffer:** Optional shortfall buffer (prototype accounting in rotator).

## 3. Lifecycle (target flows)

1. **Deposit** — BTC in → SatsShare out; principal remains claimable per vault rules.  
2. **Accrue yield** — external sources produce proofs; rotator selects source (mock).  
3. **Draw** — seed from block hashes + committed user seed → winner share indices (off-chain reference model exists; not BitVM2 circuit).  
4. **Claim prize** — winners receive yield sats (not principal).  
5. **Withdraw principal** — Lightning or on-chain path (unimplemented).  
6. **Pods** — join/leave; prize split (unimplemented).  

## 4. Draw algorithm (current reference model)

See `bitvm/draw_verifier.rs` (`select_winners`):

- Inputs: `block_hash_n`, `block_hash_n1`, `user_seed`, `total_shares`, `num_winners`.
- Combine by XOR; expand with `placeholder_mix` (NOT SHA-256 — must replace for production).
- Rejection sampling for modulo bias; unique indices.

### Production requirements (not met)

- [ ] Real SHA-256 (or circuit-equivalent) in BitVM2  
- [ ] Commit-reveal of `user_seed` before block hashes known  
- [ ] On-chain binding of inputs  
- [ ] Fraud proof / challenge game  

## 5. Governance / yield source selection

- Quadratic weight = `sqrt(votes)` per pubkey; one vote per pubkey in tally.  
- **Not sybil-resistant** under multi-key. See comments in `governance/voting.ts`.  
- Signatures today are mock hashes (`governance/crypto.ts`), not BIP-322.

## 6. Invariants (must hold in any real implementation)

1. Principal withdrawable without depending on win/loss of draws.  
2. Prize payments ≤ available verified yield (+ explicit buffer policy).  
3. No central operator key can seize principal.  
4. Draw inputs fixed before outcome; verifiable after.  
5. Public auditability of state transitions.

## 7. Open questions

- Exact vault construction (CTV/CAT vs BitVM-only).  
- Yield source whitelist and proof formats.  
- Pod custody and exit.  
- Regulatory classification per jurisdiction.

## Related

- `docs/threat-model.md`  
- `docs/production-roadmap.md`  
- `docs/audit-checklist.md`  
