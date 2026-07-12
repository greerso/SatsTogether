# SatsTogether Testnet Guide (Phase 2)

**TESTNET / SIGNET ONLY.** Not mainnet. Not audited. Do not use real funds.

Phase 2 vertical slice (current): **real Bitcoin testnet block hashes → offline draw model**.

This is **not** a full product, vault, Lightning deposit, or BitVM2 circuit. Selection still uses `sim/draw.ts` (`placeholder_mix`, not production RNG security).

---

## Prerequisites

- Node.js 22+ recommended (uses `node --experimental-strip-types`)
- Network access to a public explorer REST API (default: `mempool.space` testnet)
- Repo clone; no Bitcoin full node required for this slice

```bash
git clone https://github.com/greerso/SatsTogether.git
cd SatsTogether
# no npm install required for root pure TS (Node built-in test + strip-types)
```

---

## Phase 2 runbook — draw from testnet block hashes

### 1. Offline unit gate (always)

```bash
export PATH="$HOME/.cargo/bin:$PATH"
./scripts/smoke-test.sh
```

Must exit 0. This does **not** hit the network.

### 2. Unit tests for the testnet module (mocked HTTP)

```bash
npm test
# includes tests/testnet.test.ts (mocked fetch)
```

### 3. Live soft-check (network may be down)

```bash
./scripts/testnet-check.sh
# or:
npm run testnet:draw -- --shares 1000 --winners 5 --seed satstogether-testnet-demo
```

Expected when online:

- Banner: **TESTNET / SIGNET ONLY**
- Tip height pair and two 64-char block hashes
- Winner share indices from offline `selectWinners`

Expected when offline / explorer down:

- Message: `SOFT FAIL (network): ...`
- **Exit 0** (soft-fail by design so local/CI is not red on flaky net)

### 4. Signet (optional)

```bash
npm run testnet:draw -- --network signet --shares 500 --winners 3 --seed demo
```

### 5. Live unit path (optional)

```bash
RUN_LIVE_TESTNET=1 npm test
```

Skips the live case unless env is set.

### 6. Mainnet

- **Not supported** as a default or CLI flag for this tool.
- `scripts/deploy-mainnet.sh` must still refuse (verify: `./scripts/deploy-mainnet.sh` exits non-zero).

---

## What this proves / does not prove

| Proves | Does not prove |
|--------|----------------|
| Code can read real testnet tip hashes | Principal protection / vaults |
| Hashes feed `selectWinners` deterministically | BitVM2 fraud proofs |
| Soft-fail when explorer unreachable | MEV-resistant commit-reveal |
| CLI banners testnet-only | Production readiness |

---

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Soft fail network | Check internet; try again; use mocked `npm test` |
| `unknown option` / bad args | `npm run testnet:draw -- --help` |
| Cargo missing | Install rustup; smoke needs `cargo test` for full gate |
| Want different explorer | Not configurable in v1 except internal `baseUrl` for tests |

---

## Older checklist (still design goals — not this slice)

- [ ] Deposit BTC → SatsShare (not implemented)
- [ ] Withdraw principal via Lightning (not implemented)
- [ ] Pods, badges, tax CSV, etc. (not implemented)

Report issues in the repo.
