# Draft — Trail of Bits

**Status:** Ready to personalize and send. **Not sent.**

**To:** via https://www.trailofbits.com/contact/ (SendSafely preferred) or inquiry channel they list  
**Subject:** SatsTogether — Bitcoin prize-linked savings prototype (design + web review RFP)

---

Hi Trail of Bits team,

I'm seeking a **time-boxed security review** of SatsTogether, an early **Bitcoin L1 prize-linked savings** prototype (not mainnet, not custody, not claiming BitVM2 security).

### Links
- Repo: https://github.com/greerso/SatsTogether  
- Freeze tag: `audit-v0.1.0-prep`  
- Live sim: https://satstogether.greerso.com  
- Scope package: https://github.com/greerso/SatsTogether/blob/main/docs/phase-3-audit-package.md  
- Challenge-game design (design-only): https://github.com/greerso/SatsTogether/blob/main/docs/bitvm-challenge-game.md  
- Disclosure: https://github.com/greerso/SatsTogether/blob/main/SECURITY.md  

### Want reviewed (priority)
1. Protocol consistency: `docs/protocol-spec.md` vs `sim/*` vs web API  
2. Draw fairness assumptions (commit-reveal, seed grinding, explorer trust)  
3. Hosted web session threat model (XSS, DoS caps, cookies)  
4. Interface boundaries: what `Mock*` must become for production  
5. Optional design review of BitVM challenge-game draft (no circuits yet)

### Out of scope for this engagement
BitVM2 circuit correctness, mainnet vaults, Lightning custody, legal/regulatory opinion.

### Deliverables
Written report with severities, High+ PoCs, file-mapped fixes; optional critical retest.

### Logistics
- Budget: **{TBD}**  
- Preferred window: **{TBD}**  
- Contact: **{your email}**  

Happy to jump on a short scoping call.

Thanks,  
{Name}

---

## Notes for operator
- Prefer their **SendSafely** / secure channel for anything sensitive.  
- Attach nothing private; everything is public-repo.
