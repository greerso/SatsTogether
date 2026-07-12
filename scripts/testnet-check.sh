#!/usr/bin/env bash
# Soft-fail live check for Phase 2 testnet draw path.
# Exit 0 always if network soft-fails; non-zero only on unexpected hard errors.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "SatsTogether testnet draw check (soft-fail)"
echo "==========================================="
echo "TESTNET/SIGNET ONLY — not mainnet, not audited."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "node not found — FAIL"
  exit 1
fi

# Soft-fail is implemented inside the CLI (exit 0 on NetworkError).
node --experimental-strip-types scripts/testnet-draw.ts --shares 100 --winners 3 --seed soft-check
code=$?
if [[ "$code" -ne 0 && "$code" -ne 2 ]]; then
  echo "Unexpected exit $code"
  exit "$code"
fi
exit 0
