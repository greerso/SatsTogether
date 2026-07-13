# SatsTogether — Design reference

Source: **Claude Design** project `7b4bbce5-b885-41f1-a3ef-ef0bdaadca49`, file
`SatsTogether Flow.dc.html`. A durable decoded copy lives here:

- [`SatsTogether-Flow.dc.html`](./SatsTogether-Flow.dc.html) — the raw design canvas
  (7 screens rendered inside iOS / browser device frames).

> The design uses aspirational marketing numbers ($92,400 prizes, 12 winners, pods,
> 42-day streak, 4.1% APY, countdown). This repo is a **prototype UI mockup** — those
> figures are illustrative. The implemented app keeps a loud, persistent honesty banner
> and only wires the parts backed by real code.

## Design tokens

| Token | Value |
|---|---|
| Canvas / app bg | `#EFE7DA` / `#FBF5EC` |
| Card | `#ffffff`, border `rgba(30,24,16,.06–.08)`, radius 14–26px |
| Ink / muted / subtle | `#1E1810` / `#6B5D4C` / `#9A8B76` |
| Bitcoin orange | `#FFB443 → #F7931A → #EE6B12 / #E8620A` (gradients) |
| No-loss teal | `#12A594 / #0E9E8E / #0B7F72` |
| Alert | `#F4552E` |
| Fonts | **Bricolage Grotesque** (display), **Instrument Sans** (body) |

## Screens in the design → what was implemented

| # | Screen | In app | Wired to backend? |
|---|--------|--------|-------------------|
| 01 | Welcome | Brand header + hero title + lede | copy only |
| 02 | Deposit ("Add Bitcoin") | Deposit card, 1,000 sats = 1 SatsShare, live share preview | **Yes** → `POST /api/session/deposit` |
| — | Accrue yield | Yield-into-pool card | **Yes** → `POST /api/session/accrue` |
| 03 | Home | Live session stats (savings, yield pool, odds est., epoch) | **Yes** → `GET /api/session` |
| 04 | Weekly Draw (dark) | Dark draw panel, network/winners/seed, transparent block-hash note | **Yes** → `POST /api/session/draw` (testnet/signet tip hashes) |
| 05 | Pods | Pod card ("Diamond Hands") | illustrative — no backend, labelled |
| 06 | Withdraw (teal) | Teal withdraw panel, full-principal note | **Yes** → `POST /api/session/withdraw` |
| 07 | Desktop dashboard | Overall dashboard layout + "Recent draws" table | table **Yes** (session draw history); hero/pod/APY illustrative |

Illustrative-only elements (static, badged `illustrative` / `est.` in the UI): prize-pool
₿0.84 / $92,400 / 12 winners, countdown, streak, pods, APY. Every wired action reflects
the real in-memory session ledger (`web/session-store.ts`) and, for draws, live Bitcoin
**testnet/signet** block hashes — never mainnet, never real funds.

## Implementation

- `web/public/index.html` · `styles.css` · `app.js` — product SPA on Coolify; tokens 1:1 with design.
- Live-wired: hero prize pool, session pod, streak, positions, draw results (session ledger + testnet hashes).
- `frontend-web/` — design canvas gallery (Vite/React frames); UI mock only, not the Coolify app.
- `web/server.ts` — static allowlist + session APIs.

Run product: `npm run web` → `http://localhost:3000`.  
Design gallery: `cd frontend-web && npm run dev`.  
Tests: `npm test`.
