#!/usr/bin/env bash
# SatsTogether Phase 0 smoke test — runs real unit tests.
# Exit 0 only if Rust + TS unit suites pass.
# This does NOT mean testnet/mainnet or BitVM2 production readiness.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "SatsTogether Smoke Test (Phase 0 — unit level)"
echo "=============================================="
echo "Repo: $ROOT"
echo "This verifies offline pure-logic tests only."
echo "It does NOT verify Bitcoin, Lightning, BitVM2 circuits, or mainnet safety."
echo

FAIL=0

# --- Rust draw verifier ---
if command -v cargo >/dev/null 2>&1 || [[ -x "$HOME/.cargo/bin/cargo" ]]; then
  export PATH="${HOME}/.cargo/bin:${PATH}"
  echo "→ cargo test (bitvm/)"
  if (cd "$ROOT/bitvm" && cargo test --quiet); then
    echo "  OK cargo test"
  else
    echo "  FAIL cargo test"
    FAIL=1
  fi
else
  echo "→ cargo not found — FAIL (install rustup: https://rustup.rs)"
  FAIL=1
fi

echo

# --- TypeScript pure modules ---
if command -v node >/dev/null 2>&1; then
  echo "→ npm test (root TS unit tests)"
  if npm test; then
    echo "  OK npm test"
  else
    echo "  FAIL npm test"
    FAIL=1
  fi
else
  echo "→ node not found — FAIL"
  FAIL=1
fi

echo
if [[ "$FAIL" -ne 0 ]]; then
  echo "SMOKE FAILED — fix unit tests before claiming Phase 0 complete."
  exit 1
fi

echo "SMOKE PASSED (Phase 0 unit tests only)."
echo "Next: see docs/production-roadmap.md Phase 1."
exit 0
