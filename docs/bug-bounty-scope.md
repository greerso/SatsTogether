# Bug bounty scope (draft — not funded)

**Status:** Scope template only. **No bounty wallet is funded.**  
**Do not** submit reports expecting payout until a funded program is announced.

---

## In scope (when program is live)

| Asset | Notes |
|-------|--------|
| `sim/*` protocol accounting | Double-spend of principal, incorrect claim credits, overflow |
| `web/*` hosted prototype | Authz on sessions, XSS, RCE, mass assignment |
| `testnet/*` integration | Mainnet accidental enablement, SSRF via explorer URL |
| Spec vs implementation | Documented invariants that code violates |

## Out of scope

- Social engineering, physical attacks  
- DoS without a clear amplification bug (we already rate-limit demo/draw)  
- Issues requiring mainnet funds (there is no mainnet product)  
- Theoretical BitVM2 circuit bugs before circuits exist  
- Third-party explorer downtime  

## Severity (indicative)

| Severity | Example |
|----------|---------|
| Critical | Steal principal in a deployed vault design; remote code exec on production host |
| High | Forge claim balances across sessions; bypass Secure cookie / session isolation |
| Medium | Stored XSS via import; unbounded resource use bypassing caps |
| Low | Honesty/copy overclaim; missing rate limit on non-mutating endpoints |

## Report format (when open)

1. Summary  
2. Impact  
3. Steps to reproduce  
4. Affected commit SHA  
5. Suggested fix (optional)  

## Contact (placeholder until program is funded)

- Security contact: see root `SECURITY.md`  
- Email: **security@greerso.com** *(update before funding)*  
- PGP: **TBD**  
- Bounty wallet: **TBD — do not send funds until published**  

## Known open items from internal review (2026-07-13)

See `docs/internal-security-review-2026-07-13.md`. Remaining after follow-up hardening:

- Draw seed grindability (design; not production fairness) — ST-4  

Fixed in follow-up: ST-1…ST-3, ST-5…ST-8 (code). ST-4 remains design.
