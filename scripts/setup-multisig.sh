#!/bin/bash
set -e

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 <pubkey1> <pubkey2> <pubkey3> <pubkey4> <pubkey5>"
  echo "Creates a 3-of-5 multisig from 5 real public keys."
  exit 1
fi

echo "SatsTogether Public Multisig Setup (3-of-5, community-elected)"

# In production, signers are elected via quadratic voting on Bitcoin messages.
# Capture first so a bitcoin-cli failure (set -e) aborts before we truncate the
# output file — otherwise a bad key would leave an empty public-multisig.json.
multisig=$(bitcoin-cli createmultisig 3 "[\"$1\", \"$2\", \"$3\", \"$4\", \"$5\"]")
echo "$multisig" > docs/public-multisig.json

echo "Multisig address and redeem script saved to docs/public-multisig.json"
echo "This address receives optional yield contributions. Fully transparent."