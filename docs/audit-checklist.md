# Audit Checklist (Pre-Mainnet)

**None of the items below are satisfied yet.** This is a pre-implementation checklist of design goals for a future audit, not a status report — the underlying protocol does not exist yet.

- [ ] Schema is immutable and publicly verifiable on Bitcoin L1
- [ ] All state transitions enforce principal protection (BitVM2 fraud proofs)
- [ ] Yield proofs are real-time and on-chain verifiable
- [ ] Draw logic is MEV-resistant (commit-reveal + multiple hashes)
- [ ] Pods and multiple winners are fairly split on-chain
- [ ] Covenant migration is client-side only (no central force)
- [ ] Quadratic funding/voting is correctly implemented and sybil-resistant
- [ ] Embedded wallet is fully non-custodial with user-chosen recovery
- [ ] No central operator keys or upgrade keys exist
- [ ] All user flows (deposit, withdraw, draw, pod) have been tested by newbies

Auditor sign-off required before lifting TVL cap.