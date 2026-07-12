# SatsTogether — Production Roadmap

**Status as of 2026-07-12:** Early prototype / design reference. **No production plan existed before this document** — only aspirational checklists in `docs/audit-checklist.md` and `docs/testnet-guide.md` that correctly state *nothing is implemented or deployed*.

This roadmap is the plan. Each phase has **exit criteria** you can test. Skipping phases to “mainnet” is unsafe and out of scope.

---

## What “production-ready” means here

For a **Bitcoin L1 prize-linked savings protocol** with principal-protection claims, production-ready is **not** “UI looks finished.” It means:

| Gate | Definition |
|------|------------|
| **P0 — Honest foundation** | Code that exists is tested; claims match reality; CI/smoke green |
| **P1 — Spec & sim** | Protocol fully specified; off-chain sim matches tests; threat model written |
| **P2 — Testnet vertical slice** | One real path on Bitcoin/Lightning **testnet** (deposit or draw mock with real chain data) |
| **P3 — Security ready** | Independent review of crypto/protocol; bug bounty funded; no central keys |
| **P4 — Mainnet capped** | Mainnet with hard TVL cap, kill-switch policy, monitoring; legal review complete |
| **P5 — Production scale** | Cap raised only after audits + ops maturity |

**We are at pre-P0 / entering P0.** BitVM2 fraud proofs, real yield, and principal vaults are **design goals**, not deliverables of P0–P1.

---

## Current baseline (facts)

| Area | Reality |
|------|---------|
| Deployments | None (no testnet, no mainnet) |
| BitVM2 | Sketch / mock only (`bitvm/`, `placeholder_mix`) |
| Governance crypto | Mock hash “signatures”, not BIP-322 |
| Yield | Mock deterministic yields |
| Frontend | Expo UI mock, not wired to chain |
| Tests | Partial Rust unit tests in `draw_verifier.rs`; **no** TS suite; smoke script always fails |
| Legal / audit | Framing docs only; checklist all unchecked |

---

## Phase 0 — Honest foundation *(current focus)*

**Goal:** Anything we ship is measurable, testable, and non-misleading.

### Goals

1. Automated tests for **all pure logic that already exists** (Rust draw model, TS governance tally, mock verifier/rotator).
2. Smoke script **passes** only when those tests pass (no fake success, no always-fail with no signal).
3. Production roadmap + hybrid workflow documented (this file + `docs/hybrid-workflow.md`).
4. README/status stay honest.

### Exit criteria (all must pass)

- [x] `cargo test` in `bitvm/` — green  
- [x] Root `npm test` (or equivalent) for governance + bitvm TS + rotator — green  
- [x] `./scripts/smoke-test.sh` exits 0 when unit tests pass  
- [x] No new code path claims mainnet / real funds / real BitVM2 proofs  
- [x] This roadmap committed and linked from README  

*(Checked when Phase 0 work lands on the integration branch; re-run smoke after every change.)*

### Out of scope for P0

Real Bitcoin, Lightning, BitVM2 circuits, mainnet scripts that succeed, legal sign-off.

---

## Phase 1 — Spec & deterministic simulation

**Goal:** One written protocol you can implement against without inventing behavior.

### Goals

1. `docs/protocol-spec.md`: deposit, share accounting, yield accrual, draw, claim, withdraw, pods (even if future phases implement).  
2. `docs/threat-model.md`: MEV, sybil QV, operator keys, mock→real crypto migration.  
3. Deterministic **off-chain simulator** (TS or Rust) for draw + share ledger with property tests.  
4. Replace or wall off mock crypto behind interfaces (`Signer`, `YieldProofVerifier`) so production impls can drop in later.

### Exit criteria

- [ ] Spec reviewed (human) for internal consistency  
- [ ] Simulator tests cover: zero shares, n winners > n shares, duplicate rejection, deterministic seeds  
- [ ] Interfaces defined; mocks implement interfaces explicitly labeled `Mock*`  
- [ ] CI on GitHub (or local pre-push) runs P0+P1 tests *(note: prefer no paid GH Actions if avoided — local `smoke-test.sh` + optional free CI)*  

---

## Phase 2 — Testnet vertical slice

**Goal:** One **real** testnet integration path, not a full product.

Pick **one** slice (recommended order):

1. **Randomness / draw inputs:** read real testnet block hashes into the draw model (still off-chain selection).  
2. **Or Lightning testnet UX:** invoice pay/receive mock deposit UI with real testnet LN (no principal vault).  
3. **Or Taproot Assets testnet** experiment in isolation (if toolchain ready).

### Exit criteria

- [ ] Documented testnet runbook that a second person can follow  
- [ ] Automated or scripted check against testnet (can fail soft if network down, but code path real)  
- [ ] Frontend or CLI shows **testnet-only** banners; no mainnet defaults  
- [ ] `deploy-mainnet.sh` still refuses  

---

## Phase 3 — Security readiness

**Goal:** Fit for external review; not yet open TVL.

### Goals

1. Real message signing (BIP-322 or equivalent) for governance path if still used.  
2. BitVM2 / covenant design frozen for audit; challenge game specified.  
3. External audit engagement + public audit checklist mapped to code.  
4. Bug bounty wallet + scope.  
5. No admin upgrade keys in design (or explicit time-locked emergency path documented).

### Exit criteria

- [ ] Audit report(s) with criticals fixed  
- [ ] `docs/audit-checklist.md` items either done or explicitly deferred with reason  
- [ ] Legal framing reviewed for target jurisdictions (prize-linked savings vs gambling)  

---

## Phase 4 — Mainnet capped

**Goal:** Real BTC with **hard** safety rails.

### Goals

1. TVL cap enforced in protocol/scripts (e.g. design 10 BTC cap — exact number is a product decision).  
2. Monitoring, incident runbook, pause/migration policy.  
3. Tax CSV / audit log as far as protocol allows.  
4. Newbie UX tested on real small flows.

### Exit criteria

- [ ] Cap cannot be raised without transparent on-chain/governance process  
- [ ] Dry-run mainnet with dust amounts by team  
- [ ] Public disclosure: unaudited risks remaining  
- [ ] Auditor sign-off if claiming principal protection  

---

## Phase 5 — Production scale

Raise caps, multi-source yield, pods, QF treasury — only after P4 stability period and further audits.

---

## Success metrics by phase

| Phase | Primary metric |
|-------|----------------|
| P0 | Test suite green; smoke green; honesty preserved |
| P1 | Spec complete; sim property tests green |
| P2 | External person completes testnet slice once |
| P3 | Zero open critical audit findings |
| P4 | Cap held under real load; no loss incidents |
| P5 | Cap raise criteria met |

---

## Immediate next actions (ordered)

1. **Complete Phase 0** (this sprint): tests + smoke + this roadmap.  
2. Start Phase 1: protocol-spec outline + `Signer` / `YieldProofVerifier` interfaces.  
3. Defer UI polish and mainnet deploy work until P2+.  
4. Use hybrid pipeline: Claude for spec/review, Grok for test/implement scaffolding (`docs/hybrid-workflow.md`).

---

## Explicit non-goals until P3+

- Marketing as “no-loss guaranteed” without vault enforcement  
- Mainnet TVL marketing  
- Claiming BitVM2 security for `placeholder_mix` draw model  
- Claiming quadratic voting is sybil-resistant under mock multi-key

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2026-07-12 | First real production roadmap; P0 kickoff |

Related: `docs/audit-checklist.md`, `docs/testnet-guide.md`, `docs/legal-framing.md`, `CLAUDE.md`, `scripts/hybrid-pipeline.sh`.
