# SatsTogether — Production Roadmap

**Status as of 2026-07-12:** Early prototype / design reference with a **hosted testnet-draw simulator**.  
BitVM2 fraud proofs, real yield, and principal vaults remain **design goals**, not deliverables of P0–P3-prep.

This roadmap is the plan. Each phase has **exit criteria** you can test. Skipping phases to “mainnet” is unsafe and out of scope.

---

## What “production-ready” means here

For a **Bitcoin L1 prize-linked savings protocol** with principal-protection claims, production-ready is **not** “UI looks finished.” It means:

| Gate | Definition |
|------|------------|
| **P0 — Honest foundation** | Code that exists is tested; claims match reality; CI/smoke green |
| **P1 — Spec & sim** | Protocol fully specified; off-chain sim matches tests; threat model written |
| **P2 — Testnet vertical slice** | One real path on Bitcoin **testnet** (draw inputs from real block hashes) |
| **P3 — Security ready** | Independent review of crypto/protocol; bug bounty funded; no central keys |
| **P4 — Mainnet capped** | Mainnet with hard TVL cap, kill-switch policy, monitoring; legal review complete |
| **P5 — Production scale** | Cap raised only after audits + ops maturity |

**We are in Phase 3 prep (security readiness packaging).** Phases 0–2 exit criteria for the chosen slices are complete. P3 **exit** still requires real external audit + funded bounty — not done.

---

## Current baseline (facts)

| Area | Reality |
|------|---------|
| Deployments | Coolify HTTPS prototype: https://satstogether.greerso.com (ephemeral sim; not mainnet) |
| BitVM2 | Sketch / mock only (`bitvm/`, `placeholder_mix`); challenge game **design draft** only |
| Governance crypto | MockSigner + **Bip322Signer stub** (throws / fail-closed) |
| Yield | Mock deterministic yields (`MockBitVMVerifier`) |
| Frontend | Flow UI + interactive ledger on web; RN mock still separate |
| Tests | Rust + root `npm test`; `./scripts/smoke-test.sh`; GitHub Actions smoke workflow |
| Legal / audit | Framing + checklist **mapped**; no counsel review; no external audit |

---

## Phase 0 — Honest foundation *(complete)*

Exit criteria: all checked (cargo + npm + smoke; honesty; roadmap).

---

## Phase 1 — Spec & deterministic simulation *(complete)*

Exit criteria: all checked (spec human review, sim property tests, Mock* interfaces).

---

## Phase 2 — Testnet vertical slice *(complete — block-hash → draw)*

**Goal:** One **real** testnet integration path, not a full product.

### Exit criteria

- [x] Documented testnet runbook (`docs/testnet-guide.md`)  
- [x] Scripted check (`npm run testnet:draw` / `./scripts/testnet-check.sh`; soft-fail if network down)  
- [x] Testnet-only banners; no mainnet defaults  
- [x] `deploy-mainnet.sh` still refuses  
- [x] Hosted demo uses live testnet/signet tip hashes for draws  

**Slice shipped:** public explorer REST → offline `selectWinners` + interactive web ledger.  
**Not shipped:** Lightning vaults, Taproot Assets product path, BitVM2.

Optional future P2 slices (not required to exit): LN testnet UX, Taproot Assets experiment.

---

## Phase 3 — Security readiness *(prep in progress)*

**Goal:** Fit for external review; not yet open TVL.

### Goals

1. Real message signing (BIP-322 or equivalent) for governance path if still used.  
2. BitVM2 / covenant design frozen for audit; challenge game specified.  
3. External audit engagement + public audit checklist mapped to code.  
4. Bug bounty wallet + scope.  
5. No admin upgrade keys in design (or explicit time-locked emergency path documented).

### Prep deliverables (this repo)

- [x] `docs/phase-3-audit-package.md`  
- [x] `docs/bitvm-challenge-game.md` (design freeze draft)  
- [x] `docs/bug-bounty-scope.md` (unfunded)  
- [x] `docs/audit-checklist.md` mapped Done/Design/Mock/Deferred  
- [x] `governance/bip322-signer.ts` fail-closed stub  
- [x] CI smoke workflow (`.github/workflows/smoke.yml`)  
- [x] `docs/ops-emergency-policy.md` — pause / no stealth upgrade policy  
- [x] Mandatory seed commit-reveal for HTTPS session draws  
- [x] `docs/auditor-outreach.md` + root `SECURITY.md`  
- [x] Freeze tag `audit-v0.1.0-prep` + firm shortlist/drafts  
- [x] Claude internal security review — 2026-07-13 (`docs/internal-security-review-2026-07-13.md`); **NOT** an external/paid audit  
- [ ] Audit engagement signed — **paid external audit DEFERRED (zero budget)**  
- [ ] Bounty funded + contact published  
- [ ] Legal counsel review  

> **Paid external audit: DEFERRED (zero budget).** A Claude internal review
> (2026-07-13) was done as an honest stopgap — 2 memory-DoS issues fixed, 6 open
> (incl. draw manipulability). It is an internal model review, not external
> assurance, and **does not satisfy P3 exit**.

### Exit criteria (not met — external audit still required)

- [ ] Audit report(s) with criticals fixed  
- [ ] Checklist items either done or deferred with reason **and** external review accepted  
- [ ] Legal framing reviewed for target jurisdictions  

---

## Phase 4 — Mainnet capped

**Blocked on P3 exit.** Real BTC with hard TVL cap, monitoring, legal, auditor sign-off for principal-protection claims.

---

## Phase 5 — Production scale

Raise caps, multi-source yield, pods, QF treasury — only after P4 stability + further audits.

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

1. **Send** personalized drafts in `docs/outreach-drafts/` (see `docs/auditor-candidates.md`). Freeze tag: `audit-v0.1.0-prep`.  
2. Confirm security contact in `SECURITY.md` (and fund bounty only after contact is live).  
3. When SOW is signed, re-tag or note engagement SHA if code moved.  
4. Implement real BIP-322 (or drop governance path) after interface review.  
5. Circuit work only after challenge-game freeze checklist complete.  
6. **Do not** start mainnet deploy or TVL marketing.

---

## Explicit non-goals until P3 exit is real

- Marketing as “no-loss guaranteed” without vault enforcement  
- Mainnet TVL marketing  
- Claiming BitVM2 security for `placeholder_mix`  
- Claiming quadratic voting is sybil-resistant under mock multi-key  
- Claiming “audited” without published reports  

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2026-07-12 | First real production roadmap; P0 kickoff |
| 0.2.0 | 2026-07-12 | P0 complete; P1 sim + interfaces in progress |
| 0.3.0 | 2026-07-12 | P1 complete; Phase 2 current |
| 0.4.0 | 2026-07-12 | P2 complete; Phase 3 prep package |

Related: `docs/audit-checklist.md`, `docs/phase-3-audit-package.md`, `docs/bitvm-challenge-game.md`, `docs/testnet-guide.md`, `docs/legal-framing.md`, `CLAUDE.md`.
