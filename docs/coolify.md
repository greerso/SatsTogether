# SatsTogether Coolify deploy

**URL:** https://satstogether.greerso.com  
**Coolify app UUID:** `ewfwbpp6c6iit5e2noaj4gd9`  
**Server:** Thinkstation · destination `coolify` (`lgc4ko88o80wsogcc8kkkow8`)  
**Project:** Personal · production  

**Stack:** Node 22 Alpine Dockerfile · `web/server.ts`  
**Honesty:** Prototype status page + testnet draw API only. Not mainnet, not audited, no real funds.

## Coolify resource

| Field | Value |
|-------|--------|
| Build pack | Dockerfile |
| Port | 3000 |
| Domain | `https://satstogether.greerso.com` |
| Health path | `/health` |
| Branch | `main` |
| Repo | `https://github.com/greerso/SatsTogether` (public) |

Env:

```
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=https://satstogether.greerso.com
```

## Redeploy

```bash
coolify deploy uuid ewfwbpp6c6iit5e2noaj4gd9
```

Or push to `main` + Coolify webhook / UI Redeploy.

## Local Docker

```bash
docker build -t satstogether .
docker run --rm -p 3000:3000 -e PUBLIC_URL=http://localhost:3000 satstogether
curl -s http://127.0.0.1:3000/health
```

## CLI (no Docker)

```bash
PORT=3000 node --experimental-strip-types web/server.ts
```
