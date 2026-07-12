#!/bin/bash
echo "SatsTogether Mainnet Deployment"
echo "==============================="

read -p "This is an unaudited prototype with no working deploy path. Continue anyway? (y/n) " confirm
if [[ $confirm != "y" ]]; then
  echo "Deployment cancelled."
  exit 1
fi

echo "================================================="
echo "Mainnet deployment is NOT implemented."
echo "There is no schema deploy, no BitVM2 verifier, and no TVL cap enforcement —"
echo "a memo'd sendtoaddress cannot cap deposits, and none of this has been audited."
echo "Do NOT run anything in this repo against Bitcoin mainnet."
exit 1