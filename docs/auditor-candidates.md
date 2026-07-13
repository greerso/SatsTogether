# Auditor candidates (Phase 3 prep)

**Not endorsements. Not engagements.** Research snapshot for SatsTogether prototype review.

Freeze tag for this prep package: **`audit-v0.1.0-prep`** (`db76c9d` on `main`).

Live demo: https://satstogether.greerso.com  
Repo: https://github.com/greerso/SatsTogether  
Master scope: `docs/phase-3-audit-package.md`  
Send template: `docs/auditor-outreach.md`  
Per-firm drafts: `docs/outreach-drafts/`

---

## Fit notes for SatsTogether

This is **Bitcoin L1 design + TS/Rust offline sim + web prototype**, not an EVM DeFi farm. Prefer firms comfortable with:

- Protocol / threat-model review  
- Cryptographic design review (draw fairness, commit-reveal)  
- Web app session security  
- Bitcoin / BitVM-adjacent design (even if no circuits yet)

Competitive “audit contests” aimed only at Solidity may be a weak fit for this stage.

---

## Shortlist (2026 public presence)

| Firm | Why consider | How to contact | Fit for us |
|------|--------------|----------------|------------|
| **Trail of Bits** | Crypto + systems depth; published Bitcoin/crypto work | https://www.trailofbits.com/contact/ · SendSafely · historically `info@trailofbits.com` | Strong for design + web + crypto assumptions |
| **Cyfrin** | Protocol reviews; clear contact path | https://www.cyfrin.io/ (contact form / audits page) | Good for scoped protocol review; confirm BTC/non-EVM appetite |
| **OpenZeppelin** | Mature audit practice | Via openzeppelin.com security/audit contact | More EVM-weighted; ask for mixed TS/protocol scope |
| **Spearbit / Cantina-style** | Researcher networks | Firm site / marketplace | Possible for design contest later; less ideal as first SOW |
| **Sherlock** | Competitive audit model | sherlock.xyz | Better after code freezes as “production-shaped” |

Sources for firm landscape (general Web3 audit market, not SatsTogether-specific): industry roundups listing Sherlock, Cyfrin, OpenZeppelin, Trail of Bits, Spearbit et al. Treat rankings as marketing, not gospel.

---

## Recommended send order

1. **Trail of Bits** — design + systems + crypto first pass  
2. **Cyfrin** — parallel quote for comparison  
3. Optional third for price/timeline leverage  

Do **not** mass-blast 10 firms with identical spam.

---

## Operator checklist before send

- [x] Prep package on `main`  
- [x] Tag `audit-v0.1.0-prep`  
- [ ] Confirm security email in `SECURITY.md` (placeholder `security@greerso.com`)  
- [ ] Fill budget + preferred window in drafts  
- [ ] Send 1–2 personalized emails (or form submissions)  
- [ ] Log replies in `docs/auditor-engagement-log.md` (create when first reply arrives)

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2026-07-13 | Candidates + freeze tag |
