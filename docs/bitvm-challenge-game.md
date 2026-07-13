# BitVM2 challenge game — design freeze draft (Phase 3 prep)

**Status:** Design only. **Not implemented.** Not a security boundary.  
**Purpose:** Freeze intended behavior for future circuit work and external review.  
**Must not** be cited as “we have BitVM2 fraud proofs.”

---

## 1. Problem

SatsTogether needs (design goal):

1. **Draw integrity** — winning share indices derived from public Bitcoin block data + pre-committed user seed.  
2. **Yield integrity** — claimed yield amounts backed by proofs that can be challenged.  
3. **Principal protection** — spend paths that forbid operator theft of principal (covenant/vault; separate from this note).

Today’s code uses offline `placeholder_mix` and mock yield proofs. Production requires real hash functions inside a challengeable computation.

---

## 2. Actors

| Actor | Role |
|-------|------|
| **Prover / Operator** | Posts asserted draw result or yield amount + commitment to proof |
| **Challenger** | Anyone who posts a bond and disputes a step |
| **Bitcoin L1** | Final settlement; timeout / slashing paths |
| **Users** | Provide seeds via commit-reveal; do not need to run provers |

---

## 3. Draw challenge game (intended)

### 3.1 Inputs (public after reveal)

- `C = H(user_seed)` committed **before** block heights `n` and `n+1` are known  
- `block_hash_n`, `block_hash_n1` from Bitcoin (testnet → mainnet later)  
- `total_shares` (high-water share space)  
- `num_winners`  

### 3.2 Computation claim

Prover asserts:

```
winners = SelectWinners(block_hash_n, block_hash_n1, user_seed, total_shares, num_winners)
```

where `SelectWinners` is the **production** algorithm (real SHA-256, not `placeholder_mix`), with rejection sampling and uniqueness as in `sim/draw.ts` / `bitvm/draw_verifier.rs`.

### 3.3 Protocol sketch

1. **Commit phase** — users (or pool operator aggregating commits) publish `C = SHA256(user_seed || domain)`.  
2. **Execution phase** — after tip includes blocks `n` and `n+1`, prover reveals seed + posts winners + proof commitment.  
3. **Challenge window** — any party may challenge a specific step of the computation with a bond.  
4. **Bisection** — interactive bisection to a single disputed step (BitVM2-style).  
5. **On-chain step verification** — one step verified in a Bitcoin script / BitVM leaf.  
6. **Timeout** — if unchallenged past `T` blocks, claim finalizes; if prover fails defense, bond slashed and claim rejected.

### 3.4 Failure modes (must be specified in circuit audit)

| Failure | Expected outcome |
|---------|------------------|
| Prover lies about winners | Challenger wins bond; winners discarded |
| Prover withholds reveal | Timeout; draw aborts or re-runs next epoch |
| Challenger griefs | Challenger bond slashed on failed challenge |
| Explorer lies about hashes (web prototype) | **Out of scope for BitVM** — production must use on-chain or SPV-verified hashes |

### 3.5 Explicit non-claims

- Current web/demo is **operator-manipulable** (optional commit, offline mix).  
- No circuit, no bisection, no bonds exist in this repo.

---

## 4. Yield proof challenge game (intended)

### 4.1 Claim

Prover asserts: “source `S` earned `Y` sats over epoch `E`,” with proof blob `π`.

### 4.2 Verifier interface (already in code)

```ts
interface YieldProofVerifier {
  isValidYieldProof(source: string, amountSats: number, proof: string | null): boolean;
}
```

Production: `isValidYieldProof` must verify a challengeable proof, not `MockBitVMVerifier`.

### 4.3 Protocol sketch

1. Prover posts `(S, Y, π, commitment)`.  
2. Challenge window with bisection over proof verification circuit.  
3. Only finalized `Y` may enter the prize pool (rotator must refuse un-finalized amounts).

### 4.4 Rotator policy (design)

- Prefer sources with healthy proofs.  
- Buffer draw-down only when all sources fail (as in current mock rotator — keep semantics when real proofs land).

---

## 5. Alignment with current code

| Design item | Code today |
|-------------|------------|
| SelectWinners | `sim/draw.ts` / `draw_verifier.rs` — **algorithm shape** only |
| Commit-reveal | Web optional sha256 string commit — **not** on-chain |
| Yield verifier | `MockBitVMVerifier` — always/mock valid |
| Challenge / bonds | **Absent** |

Golden vectors in tests lock TS↔Rust offline alignment so a future circuit can target one reference.

---

## 6. Freeze checklist (before paying for circuit audit)

- [ ] Finalize domain separation for `user_seed` commitments  
- [ ] Choose hash: SHA-256 vs SHA-256d vs tagged hash  
- [ ] Fix attempt budget / empty-winner policy on-chain  
- [ ] Specify bond sizes and timeout heights  
- [ ] Specify who may challenge (anyone vs bonded set)  
- [ ] Map each circuit step to a unit test vector  
- [ ] Independent review of this document  

---

## 7. Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0-draft | 2026-07-12 | First design freeze draft for Phase 3 prep |
