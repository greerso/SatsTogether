# Auditor outreach package (ready to send)

**Purpose:** One place to copy/paste when commissioning a Phase 3 review.  
**Not an engagement.** No NDA signed; no SOW; no payment committed.

---

## 1. Suggested email (customize TO / signature)

**Subject:** SatsTogether prototype — Phase 3 protocol/web review RFP (Bitcoin prize-linked savings design)

Hi {Name},

I'm looking for a **time-boxed security review** of an early Bitcoin L1 prize-linked
savings prototype (SatsTogether). This is **not** a production custody system and is
**not** claiming BitVM2 security or mainnet readiness.

### What exists
- Open source: https://github.com/greerso/SatsTogether  
- Live **testnet-hash → offline draw** simulator: https://satstogether.greerso.com  
- Phase 3 prep package: `docs/phase-3-audit-package.md`  
- Challenge-game design (design-only): `docs/bitvm-challenge-game.md`  
- Threat model: `docs/threat-model.md`  
- Ops / pause policy: `docs/ops-emergency-policy.md`  

### What we want reviewed (priority order)
1. Protocol consistency: `docs/protocol-spec.md` vs `sim/*` vs web API  
2. Draw fairness assumptions (commit-reveal, seed grinding, explorer trust)  
3. Hosted web session threat model (XSS, DoS caps, cookies) — post hardening PRs  
4. Interface boundaries: what `Mock*` must become for production  
5. Optional design review of BitVM challenge game draft (no circuits yet)

### Explicitly out of scope for this engagement
- BitVM2 circuit correctness (circuits do not exist yet)  
- Mainnet vault / Lightning custody  
- Legal/regulatory opinion (separate counsel)  

### Deliverables requested
- Written report (markdown or PDF) with severity ratings  
- Reproducible PoCs for High+  
- Fix recommendations mapped to file paths  
- Optional retest of criticals after we patch  

### Repo hygiene for reviewers
```bash
git clone https://github.com/greerso/SatsTogether
cd SatsTogether
export PATH="$HOME/.cargo/bin:$PATH"
./scripts/smoke-test.sh
# optional live explorer
./scripts/testnet-check.sh
```

Happy to schedule a short scoping call. Budget / timeline: **{TBD — fill in}**.

Thanks,  
{Your name}  
{Contact}

---

## 2. One-page fact sheet (attach or paste)

| Fact | Value |
|------|--------|
| Product claim today | Prototype / design reference only |
| Live URL | https://satstogether.greerso.com |
| Repo | https://github.com/greerso/SatsTogether |
| Chain interaction | Testnet/signet block hashes via public explorers |
| Draw crypto | Offline `placeholder_mix` (not SHA-256 / not BitVM2) |
| Custody | None — ephemeral in-memory sessions |
| Mainnet deploy | Refused by script |
| Seed policy (HTTPS) | Mandatory commit-reveal for session draws |
| License | MIT (as stated in repo) |

---

## 3. Document index for the reviewer

| Doc | Why |
|-----|-----|
| `docs/phase-3-audit-package.md` | Master scope |
| `docs/protocol-spec.md` | Intended behavior |
| `docs/threat-model.md` | Adversaries |
| `docs/bitvm-challenge-game.md` | Future circuit design |
| `docs/ops-emergency-policy.md` | Pause / no stealth upgrades |
| `docs/audit-checklist.md` | Status mapping |
| `docs/bug-bounty-scope.md` | Future bounty (unfunded) |
| `SECURITY.md` | Disclosure process |

---

## 4. Operator checklist before sending

- [x] Prep package on `main`  
- [x] Tag freeze: `audit-v0.1.0-prep` (points at prep package SHA)  
- [x] Candidate list + per-firm drafts: `docs/auditor-candidates.md`, `docs/outreach-drafts/`  
- [ ] Fill budget / timeline in the chosen draft  
- [ ] Confirm security contact in `SECURITY.md`  
- [ ] Send 1–2 personalized inquiries (Trail of Bits + Cyfrin recommended first)  
- [ ] Log replies when they arrive  

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2026-07-12 | First send-ready outreach package |
| 0.1.1 | 2026-07-13 | Freeze tag + firm drafts + candidates |
