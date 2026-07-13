# SatsTogether / coding handoff

## Project
- Path: `~/dev/Bitcoin/SatsTogether`
- Live: https://satstogether.greerso.com (Coolify `ewfwbpp6c6iit5e2noaj4gd9`)

## Phase status
- P0–P2 complete
- P3 prep complete enough to **send**: auditor-outreach + SECURITY.md + audit package
- P3 exit still needs: signed engagement, funded bounty, legal counsel

## Your next human step
1. Open `docs/auditor-outreach.md`
2. Fill budget/timeline + confirm `security@greerso.com` in `SECURITY.md`
3. Send the email template to 2–3 candidate auditors

## Verify
```bash
./scripts/smoke-test.sh
curl -s https://satstogether.greerso.com/health
```
