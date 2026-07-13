# Operator emergency & pause policy (prototype → future production)

**Status:** Policy design for Phase 3 prep. The Coolify web app is a **simulator**, not a custody system.  
This document states what *will* apply when/if a mainnet vault product exists, and what applies **today**.

---

## 1. Today (hosted prototype)

| Control | Reality |
|---------|---------|
| Pause protocol | N/A — no principal vault; stop Coolify app if needed |
| Kill-switch keys | **None** — no admin upgrade keys in protocol code |
| Incident response | Redeploy from known-good `main` SHA; rotate Coolify env if secrets ever added |
| Session data | Ephemeral RAM; loss on restart is expected |
| Draw manipulation | Mitigated partially by **mandatory seed commit-reveal** on session draws |

**Emergency contact (prototype ops):** site operator / repo maintainer (not a 24/7 SOC).

---

## 2. Future production (P4+, design goals)

### 2.1 Pause / freeze

If a critical bug is confirmed in vaults or draw finality:

1. **Pause new deposits** via documented governance/time-lock (no silent admin key).  
2. **Allow principal withdraws** if safe; otherwise publish a migration path (`covenant-migration` design).  
3. **Halt prize finalization** until challenge window / fix is complete.

### 2.2 No stealth upgrades

- No hot “operator upgrade key” that can rewrite vault rules.  
- Any parameter change (TVL cap, timeouts) must be transparent (on-chain vote or time-locked publish).  
- Emergency exception (if any) must be **pre-specified** in the audited design with delay + public notice.

### 2.3 Incident runbook outline

1. Detect (monitoring / bounty report)  
2. Assess severity (principal at risk? yield only? web-only?)  
3. Communicate (status page + GitHub security advisory)  
4. Contain (pause deposits / disable draw finalization)  
5. Remediate + post-mortem  
6. Resume only after review  

### 2.4 What is *not* an emergency

- Explorer (mempool.space) downtime — soft-fail draw; retry  
- Single user lost session cookie — expected; export/import is the workaround  
- Marketing misunderstandings — fix copy, not protocol  

---

## 3. Alignment with code

| Policy item | Code |
|-------------|------|
| Mainnet refuse | `scripts/deploy-mainnet.sh` |
| Mandatory seed commit (session draw) | `web/session-store.ts` `assertSeedReveal(..., { required })`; HTTPS default |
| Rate limits | demo/draw cooldowns in `web/server.ts` |
| No admin API | No authenticated operator endpoints |

---

## 4. Document control

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0-draft | 2026-07-12 | First ops policy for P3 prep |
