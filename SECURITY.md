# Security Policy

## Supported versions

This repository is an **early prototype**. There is no supported production release
and no mainnet product. Security reports are still welcome for:

- The hosted prototype at https://satstogether.greerso.com  
- Source on branch `main`  

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

1. Prefer GitHub Security Advisories:  
   https://github.com/greerso/SatsTogether/security/advisories/new  
2. Or email: **security@greerso.com** *(update if different)*  

Include:

- Description and impact  
- Steps to reproduce  
- Affected commit SHA or deploy URL  
- Whether you plan public disclosure and preferred timeline  

## Scope notes (honest)

| In scope | Out of scope |
|----------|--------------|
| Prototype web session isolation, XSS, RCE | Social engineering |
| Sim ledger accounting bugs | Theoretical BitVM2 circuits (not implemented) |
| Accidental mainnet enablement | Third-party explorer outages |
| Spec vs code invariant breaks | Issues requiring real mainnet funds |

See also: `docs/bug-bounty-scope.md` (bounty **not funded** yet).

## Response targets (best effort)

| Step | Target |
|------|--------|
| Acknowledge report | 5 business days |
| Initial severity triage | 10 business days |
| Fix or public status for High+ | As soon as practical |

These are **targets**, not SLAs. This is a prototype project without a 24/7 SOC.

## Safe harbor

We will not pursue legal action against researchers who:

- Act in good faith  
- Avoid privacy violations, data destruction, and service disruption beyond minimal PoC  
- Give us a reasonable chance to fix before public disclosure of High/Critical issues  

## Production disclaimer

Nothing in this repository should be used with real funds. “No-loss” and BitVM2
principal protection are **design goals**, not implemented guarantees.
