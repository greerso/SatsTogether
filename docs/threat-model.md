# SatsTogether Threat Model (Phase 1 draft)

**Status:** Draft. Assumes future real cryptography and vaults; current code is mock/prototype.

## Assets to protect

| Asset | Impact if lost |
|-------|----------------|
| User principal BTC | Critical — core product promise |
| Accrued yield | High |
| Draw fairness / unpredictability | High (trust, legal) |
| User keys / recovery | Critical |
| Governance integrity | Medium–High (yield source selection) |

## Trust boundaries

| Boundary | Today | Target |
|----------|-------|--------|
| Draw “crypto” | `placeholder_mix` (not crypto) | BitVM2 + real hash |
| Message signing | Mock hash equality | BIP-322 / real ECDSA |
| Yield proofs | Manufactured mock strings | On-chain verifiable proofs |
| Frontend | Mock UI | Non-custodial wallet; no server key |

## Adversaries

1. **External thief** — steals keys, phishes, malware.  
2. **MEV / miner** — biases block-based randomness without commit-reveal.  
3. **Malicious prover** — false yield proofs.  
4. **Sybil voter** — many keys vs quadratic voting.  
4b. **Weight forger** — single key asserts unbounded QV weight (mock signs asserted weight; tally does not recompute sqrt(votes)).  
5. **Malicious client** — lies about local state.  
6. **Insider / “operator”** — any residual privileged key.  
7. **Legal / regulatory** — product treated as gambling; freeze risk.

## Attacks & mitigations (design)

| Attack | Current exposure | Target mitigation |
|--------|------------------|-------------------|
| Fake yield | Trivial (mock always valid) | BitVM2 verify + bonds + challenge |
| Biased draw | High if seeds known early | Commit-reveal + multi-block entropy |
| Principal theft | N/A (no vault) | Covenant/BitVM principal vaults; no admin key |
| QV sybil | Acknowledged; not mitigated | Identity/cost voting or drop QV claims |
| QV weight forgery | Trivial under MockSigner (assert any weight) | Bind votes; recompute weight in tally; real sigs |
| UI overclaim | Mitigated by docs honesty | Keep banners; no mainnet default |
| Supply-chain | Standard npm/cargo | Lockfiles, review upgrades |

## Explicit non-claims (until proven)

- No claim of principal protection in software today.  
- No claim of MEV-resistant draws today.  
- No claim of sybil-resistant quadratic voting today.  
- No claim that mock QV weights are integrity-checked (weight is caller-asserted).  
- No claim of production BitVM2 security for current modules.

## Residual risk acceptance

Any testnet/mainnet step requires updating this document with residual risks users must accept (including unaudited code).
