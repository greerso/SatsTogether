# SatsTogether Protocol Spec (Phase 1)

**Status:** Phase 1 implementation-oriented protocol for offline sim + interfaces.  
**Human-reviewed** 2026-07-12 for internal consistency (after Opus critical-assessment + follow-ups).  
**Not audited. Not mainnet.** Spec is authoritative for `sim/` and pure logic only.  
On-chain vaults, BitVM2 circuits, and Lightning settlement are **design targets** called out explicitly as unimplemented.

Related: `docs/threat-model.md`, `docs/production-roadmap.md`, `sim/`, `bitvm/draw_verifier.rs`.

---

## 0. Scope & honesty

| In scope (Phase 1) | Out of scope (later phases) |
|--------------------|-----------------------------|
| Share accounting rules (sim) | Covenant/BitVM principal vaults |
| Draw selection algorithm (reference) | BitVM2 fraud proofs / bonds |
| Yield proof **interface** | Real DLC/Ark yield proofs |
| Signer **interface** | BIP-322 / wallet signing |
| Governance tally (mock sigs) | Sybil-resistant identity |
| Prize pool accounting (sim) | Lightning claim/withdraw rails |

Code map:

| Concern | Module |
|---------|--------|
| Draw selection (Rust ref) | `bitvm/draw_verifier.rs` |
| Draw selection (TS sim) | `sim/draw.ts` |
| Share ledger sim | `sim/ledger.ts` |
| Signer interface | `governance/signer.ts` |
| Mock signer | `governance/crypto.ts` (`MockSigner`) |
| Yield proof interface | `bitvm/yield-proof.ts` |
| Mock yield verifier | `bitvm/verifier.ts` (`MockBitVMVerifier`) |
| Yield source rotation | `yield-adapters/rotator-v0.6.ts` |
| QV tally | `governance/voting.ts` |

---

## 1. Actors

| Actor | Role | Phase 1 reality |
|-------|------|-----------------|
| Depositor | Locks BTC; receives share units | Sim only (`ShareLedger.deposit`) |
| Prover | Submits yield claims + bond | Unimplemented |
| Challenger | Disputes invalid proofs | Unimplemented |
| Draw coordinator | Combines seeds → winners | Offline `selectWinners` |
| Pod member | Pooled odds / prize split | Unimplemented |
| Voter | Quadratic vote on yield source | Mock signatures only |

---

## 2. Units & assets

### 2.1 Principal

- Denominated in **sats** (integer, non-negative).
- Design goal: principal remains claimable regardless of draw outcomes.
- Phase 1 sim enforces this accounting-wise (`withdraw` returns full `principalSats` even after draws).

### 2.2 SatsShare

- Participation unit in the prize pool.
- **Sim parameter:** `SATS_PER_SHARE` (default `1000`). Deposit amount must be a multiple.
- Share indices are global, non-negative integers assigned contiguously at mint time.
- Withdrawn shares are **burned** (index becomes unowned). High-water `nextShareIndex` does not shrink (indices stay stable).

### 2.3 Yield pool

- Accrued prize budget in sats.
- Increased by `accrueYield` (sim) / future verified proofs.
- Decreased only by **prize allocation** into `DrawRecord` (audit sink; not user delivery yet).
- Rotator liquidity buffer is separate accounting (see §2.4), not the share-ledger yield pool.

### 2.4 Liquidity buffer (rotator)

- Optional shortfall buffer tracked by `YieldRotatorV0_6` pool state.
- Drawn down only when **all** configured yield sources fail validity checks.
- Not principal; not share-backed.
- **Not part of share-ledger invariant #2.** Rotator buffer is a separate mock path; prize-budget invariant applies to verified yield / ledger `yieldPool` only until a joint policy is specified.

---

## 3. Lifecycle (state machine)

```
[idle]
  | deposit(account, principalSats)
  v
[position open] --accrueYield--> [position open, yield↑]
  | draw(seeds, numWinners)
  v
[position open, yield↓, draw recorded]
  | withdraw(account)
  v
[idle for account; shares burned]
```

### 3.1 Deposit

**Preconditions**

- `principalSats > 0`
- `principalSats % SATS_PER_SHARE == 0`

**Effects**

- `shareCount = principalSats / SATS_PER_SHARE`
- Assign indices `[nextShareIndex, nextShareIndex + shareCount)` as a new **segment**
- `nextShareIndex += shareCount`
- If account already has a position: **top-up** — append segment, increase principal/shareCount
  (segments may be non-contiguous if other accounts minted in between)
- Else: create position with one segment

**Failure modes**

- Non-multiple principal → reject

### 3.2 Accrue yield

**Preconditions:** `amountSats >= 0`  
**Effects:** `yieldPool += amountSats`  
**Non-effects:** Does not mint shares; does not change principal.

Production: amount must come from `YieldProofVerifier.isValidYieldProof` + settlement rules (unimplemented).

### 3.3 Draw

**Inputs**

| Field | Type | Notes |
|-------|------|-------|
| `block_hash_n` | 32 bytes | Design: Bitcoin block hash at height n |
| `block_hash_n1` | 32 bytes | Design: adjacent block for entropy |
| `user_seed` | 32 bytes | Design: commit-reveal before hashes known |
| `total_shares` / space | u64 | Sim uses high-water `nextShareIndex` |
| `num_winners` | u32 | Requested winner slots |

**Algorithm** (reference — must match Rust + TS):

1. If space == 0 → return `[]`.
2. `combined[i] = block_hash_n[i] XOR block_hash_n1[i] XOR user_seed[i]`.
3. `target = min(num_winners, space)` (requested max).
4. Expand with `placeholder_mix(combined, counter)` (NOT SHA-256).
5. Take first 8 bytes as little-endian u64 candidate.
6. Rejection sampling: discard if `candidate >= limit` where  
   `limit = u64::MAX - (u64::MAX % space)` to remove modulo bias.
7. `index = candidate % space`; skip if already selected.
8. Cap attempts; return **up to** `target` distinct indices (may be shorter if budget exhausted).

**Prize allocation (sim — not delivery)**

- Filter winners to indices that still have an owner (skip burned). **No re-sample:** burned slots are wasted; live winner count may be `< min(num_winners, live_shares)`.
- High-water draw + skip-burned can **concentrate** remaining pool among fewer live winners under churn (known sim policy).
- `prizePerWinner = floor(yieldPool / liveWinnerCount)` (0 if none).
- `allocated = prizePerWinner * liveWinnerCount` (removed from pool into `DrawRecord` audit sink).
- `yieldPool -= allocated` (remainder `yieldPool % liveCount` stays).
- Record `DrawRecord`. **No per-account claim balance yet** — allocated ≠ paid to user.

**Production requirements (not met)**

- [ ] Real SHA-256 (or circuit-equivalent) inside BitVM2  
- [ ] Commit-reveal of `user_seed` before block hashes known  
- [ ] On-chain binding of inputs  
- [ ] Fraud proof / challenge game  
- [ ] Explicit prize delivery rail (Lightning invoice / on-chain)

### 3.4 Claim prize

- Design: winners receive **yield sats only**, never principal.
- Sim: `DrawRecord.allocated` is an epoch audit sink only; per-account claim balances are future work.
- Invariant: sum of yield allocated from the share-ledger pool ≤ that epoch's yield pool before allocation (rotator buffer is out of scope for this bound; §2.4).

### 3.5 Withdraw principal

**Preconditions:** open position for account  
**Effects:** burn all shares; return `principalSats`; remove ownership map entries  
**Invariant:** withdraw success does not depend on win/loss history.

### 3.6 Pods (unimplemented)

- Join/leave pool; fair prize split among pod members when any member share wins.
- Custody and exit rules TBD.

---

## 4. Interfaces (swap points for production)

### 4.1 `Signer` (`governance/signer.ts`)

```ts
interface Signer {
  signMessage(message: string, privKey: string): Promise<string>;
  verifyMessage(message: string, signature: string, pubKey: string): boolean;
}
```

| Impl | Label | Status |
|------|-------|--------|
| `MockSigner` | Mock* | Current default |
| BIP-322 signer | (future) | Not implemented |

**Mock contract:** verification succeeds when `pubKey` string equals the `privKey` string used to sign (no EC crypto).

### 4.2 `YieldProofVerifier` (`bitvm/yield-proof.ts`)

```ts
interface YieldProof {
  source: string;
  yieldSats: number;
  onChainProof: string | null;
  valid: boolean;
}

interface YieldProofVerifier {
  generateProof(source: string): Promise<YieldProof>;
  isValidYieldProof(proof: YieldProof): boolean;
}
```

| Impl | Label | Status |
|------|-------|--------|
| `MockBitVMVerifier` | Mock* | Deterministic fake yields |
| On-chain BitVM2 verifier | (future) | Not implemented |

**Mock validity:** `valid && onChainProof != null && yieldSats > 0`.

### 4.3 Rotator dependency injection

`YieldRotatorV0_6` accepts optional `YieldProofVerifier` (default `MockBitVMVerifier`). Production drops in a real verifier without changing rotation policy.

---

## 5. Governance (yield source selection)

### 5.1 Vote message

```
Vote:{source}:{weight}
```

where `castVote` sets `weight = sqrt(votes)` (IEEE floating; prototype only — production should use fixed-point).

**Prototype gap:** tally does **not** recompute `sqrt(votes)` and does **not** bind a `votes` field. The signed payload carries only `weight`. Anyone who can produce a valid signature for a pubkey (under MockSigner: anyone who knows the key string) can assert an arbitrary `weight`. Quadratic form is a **client convention**, not an enforced tally invariant.

### 5.2 Tally rules

1. Skip invalid signatures (`Signer.verifyMessage`).
2. At most **one vote per pubkey** — first **valid** (verifying) vote wins; invalid earlier votes do not burn the slot.
3. Sum asserted `weight` values per `source` (no re-derivation from votes).
4. Winner = source with maximum weight (ties: reduce picks last-seen max — unstable; production should break ties deterministically e.g. lexicographic source id).

### 5.3 Explicit non-claims

- Not **sybil-resistant** under multi-key (N keys → N votes).
- Not **weight-integrity** under mock/self-signed weights (single key can assert unbounded weight).
- See `governance/voting.ts` header and `docs/threat-model.md`.

---

## 6. Protocol invariants

Must hold in any real implementation and are checked in sim tests where applicable:

1. **Principal independence** — withdraw principal without depending on draw outcomes.  
2. **Prize budget** — for a share-ledger draw epoch, `allocated ≤ yieldPool` before allocation (rotator buffer is separate; §2.4).  
3. **No admin seize** — no central operator key can seize principal (design; no vault yet).  
4. **Draw binding** — inputs fixed before outcome; verifiable after (design; offline model only today).  
5. **Share uniqueness in draw** — a single draw never returns duplicate indices.  
6. **Index bounds** — every winner index `< share space`.  
7. **Determinism** — identical seeds + space + num_winners → identical winner list.  
8. **Auditability** — state transitions publicly reconstructible from inputs (sim snapshot).

---

## 7. Error catalog (sim / pure logic)

| Code / condition | Where | Handling |
|------------------|-------|----------|
| zero share space | draw | empty winners |
| num_winners > space | draw | cap target at space |
| non-32-byte hash/seed | draw | throw |
| non-integer / out-of-range numWinners | draw | throw |
| totalShares > u64 | draw | throw |
| empty account | deposit | throw |
| principalSats ≤ 0 | deposit | throw |
| non-multiple deposit | deposit | throw |
| second open position (sim v1) | deposit | throw |
| amountSats < 0 | accrueYield | throw |
| no position | withdraw | throw |
| invalid mock sig | tally | skip vote |
| duplicate pubkey (after a valid vote) | tally | skip later votes |
| all sources invalid | rotator | buffer path |

---

## 8. Open questions

- Exact vault construction (CTV/CAT vs BitVM-only).  
- Yield source whitelist and real proof formats.  
- Pod custody and exit.  
- Fixed-point vs float for QV weights; binding `votes` in the signed message so tally can recompute weight.  
- Prize claim UX (push vs pull) and tax lots.  
- Tie-breaking for governance and multi-winner prize remainders (`yieldPool % n` stays in pool — intentional).  
- Whether to re-sample draw slots that land on burned indices (today: waste slots / concentrate prizes).  
- Joint yield + rotator-buffer accounting for production prize budget.  
- Regulatory classification per jurisdiction (`docs/legal-framing.md`).

---

## 9. Version

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0-draft | 2026-07-12 | Outline |
| 0.2.0-draft | 2026-07-12 | Implementation-ready: lifecycle, interfaces, sim map, invariants |
| 0.2.1-draft | 2026-07-12 | Opus critical-assessment fixes: QV weight honesty, first-valid, burn concentration, error catalog |
| 0.3.0 | 2026-07-12 | Human-reviewed for Phase 1 internal consistency (Danny); still prototype, not mainnet |

Phase 1 exit criterion “spec reviewed (human) for internal consistency” is **met** as of 2026-07-12. Remaining gaps are open questions / later-phase design, not unreviewed contradiction.
