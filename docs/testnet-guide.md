# SatsTogether Testnet Guide (0.1.0-prototype)

This is a **prototype**. There is no testnet deployment, and `./scripts/deploy-testnet.sh` **does not exist**. Right now you can only:

1. Clone repo: `git clone ... && cd SatsTogether`
2. Read the code in `schema/`, `bitvm/`, `yield-adapters/`, and `governance/` as a design reference — it does not run.
3. Optionally set up a frontend toolchain and run the UI mockup: `cd frontend && npm install && npm start` (Expo). This renders mockup screens only; it is not wired to any real Bitcoin, Lightning, or BitVM2 backend.

See README.md for the full feature list, architecture, and current status.

## Testing Checklist (design goals — none of these are working flows yet)
- [ ] Deposit BTC → receive SatsShare tokens (not implemented)
- [ ] Withdraw principal instantly via Lightning (not implemented)
- [ ] View live Yield Health + BitVM2 proofs (not implemented)
- [ ] Participate in draw (multiple winners) (not implemented)
- [ ] Create/Join a Pod and split prizes (not implemented)
- [ ] Build a savings streak and earn badges (not implemented)
- [ ] Opt-in to optional quadratic community contribution (not implemented)
- [ ] Run your own light-client indexer (not implemented)
- [ ] Export tax CSV of prizes (not implemented)
- [ ] Trigger/test covenant migration (not implemented)

These are the flows the design aims for; none exist yet. There is nothing to test end-to-end today.

Report issues in the repo. No testnet or mainnet deployment exists.