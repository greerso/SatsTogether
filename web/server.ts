/**
 * SatsTogether Coolify web service — prototype status + testnet draw API.
 *
 * LISTENS on PORT (default 3000). TESTNET tooling only; not mainnet, not audited.
 * Do not use real funds.
 */

import { createServer } from 'node:http';
import { NetworkError } from '../testnet/block-hash.ts';
import { runTestnetDraw, TESTNET_BANNER } from '../testnet/draw-from-chain.ts';
import type { ChainNetwork } from '../testnet/block-hash.ts';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function landingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SatsTogether — Prototype</title>
  <style>
    :root { color-scheme: dark; --bg:#0b0f14; --card:#141b24; --text:#e8eef6; --muted:#8b9bb0; --accent:#f7931a; --warn:#ff6b6b; --ok:#3dd68c; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    main { max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.25rem; color: var(--accent); }
    .banner { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.72rem; background:#1a1010; border:1px solid #5c2a2a; color:#ffb4b4; padding:1rem; border-radius:8px; margin:1.25rem 0; overflow-x:auto; }
    .card { background:var(--card); border:1px solid #243041; border-radius:12px; padding:1.25rem; margin:1rem 0; }
    label { display:block; font-size:0.85rem; color:var(--muted); margin-top:0.75rem; }
    input, select, button { width:100%; margin-top:0.35rem; padding:0.6rem 0.75rem; border-radius:8px; border:1px solid #334155; background:#0f1520; color:var(--text); font-size:1rem; }
    button { background:var(--accent); color:#111; border:none; font-weight:700; cursor:pointer; margin-top:1rem; }
    button:disabled { opacity:0.6; cursor:wait; }
    pre { background:#0a0e14; border-radius:8px; padding:1rem; overflow:auto; font-size:0.8rem; border:1px solid #243041; }
    a { color: var(--accent); }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .pill { display:inline-block; padding:0.15rem 0.5rem; border-radius:999px; background:#2a1a08; color:var(--accent); font-size:0.75rem; font-weight:600; }
  </style>
</head>
<body>
  <main>
    <span class="pill">PROTOTYPE · TESTNET TOOLING</span>
    <h1>SatsTogether</h1>
    <p class="muted">Bitcoin L1 prize-linked savings design reference. Not mainnet. Not audited. No real-funds paths.</p>
    <div class="banner">${htmlEscape(TESTNET_BANNER)}</div>

    <div class="card">
      <h2 style="margin-top:0;font-size:1.1rem;">Status</h2>
      <p class="muted">Phase 0–1 offline tests · Phase 2 testnet block-hash → offline draw. Hosted at <code>${htmlEscape(PUBLIC_URL)}</code>.</p>
      <ul class="muted">
        <li><a href="/health">/health</a> — liveness JSON</li>
        <li><a href="/api/status">/api/status</a> — service metadata</li>
        <li><code>POST/GET /api/testnet/draw</code> — live explorer hashes → offline winners</li>
      </ul>
    </div>

    <div class="card">
      <h2 style="margin-top:0;font-size:1.1rem;">Testnet draw</h2>
      <p class="muted">Fetches real testnet/signet tip hashes from a public explorer, then runs offline <code>selectWinners</code>. Soft-fails if the explorer is unreachable.</p>
      <label>Network
        <select id="network">
          <option value="testnet" selected>testnet</option>
          <option value="signet">signet</option>
        </select>
      </label>
      <label>Shares <input id="shares" type="number" min="1" value="1000" /></label>
      <label>Winners <input id="winners" type="number" min="0" value="5" /></label>
      <label>Seed <input id="seed" type="text" value="satstogether-web-demo" /></label>
      <button id="go" type="button">Run testnet draw</button>
      <pre id="out" hidden></pre>
    </div>

    <p class="muted">Docs: <a href="https://github.com/greerso/SatsTogether">github.com/greerso/SatsTogether</a> · <code>docs/testnet-guide.md</code></p>
  </main>
  <script>
    const out = document.getElementById('out');
    const btn = document.getElementById('go');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      out.hidden = false;
      out.textContent = 'Fetching testnet tip hashes…';
      const q = new URLSearchParams({
        network: document.getElementById('network').value,
        shares: document.getElementById('shares').value,
        winners: document.getElementById('winners').value,
        seed: document.getElementById('seed').value,
      });
      try {
        const res = await fetch('/api/testnet/draw?' + q.toString());
        const body = await res.json();
        out.textContent = JSON.stringify(body, null, 2);
      } catch (e) {
        out.textContent = String(e);
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

function json(res: import('node:http').ServerResponse, status: number, body: unknown) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(data);
}

function parseDrawQuery(url: URL) {
  const networkRaw = url.searchParams.get('network') || 'testnet';
  if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
    throw new Error('network must be testnet or signet (mainnet refused)');
  }
  const network = networkRaw as ChainNetwork;
  const sharesStr = url.searchParams.get('shares') || '1000';
  if (!/^\d+$/.test(sharesStr) || BigInt(sharesStr) <= 0n) {
    throw new Error('shares must be a positive integer');
  }
  const winners = Number(url.searchParams.get('winners') || '5');
  if (!Number.isInteger(winners) || winners < 0) {
    throw new Error('winners must be a non-negative integer');
  }
  const seed = url.searchParams.get('seed') || 'satstogether-web-demo';
  return { network, totalShares: BigInt(sharesStr), numWinners: winners, userSeed: seed };
}

const server = createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);

  try {
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = landingHtml();
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(html);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, {
        ok: true,
        service: 'satstogether',
        status: 'prototype',
        network_default: 'testnet',
        mainnet: false,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/status') {
      json(res, 200, {
        name: 'SatsTogether',
        version: '0.1.0-prototype',
        phase: 'P2 testnet block-hash slice',
        public_url: PUBLIC_URL,
        honesty: [
          'Not mainnet',
          'Not audited',
          'Offline draw model (placeholder_mix)',
          'No real-funds / vaults / BitVM2 circuit',
        ],
        endpoints: ['/', '/health', '/api/status', '/api/testnet/draw'],
      });
      return;
    }

    if (
      (req.method === 'GET' || req.method === 'POST') &&
      url.pathname === '/api/testnet/draw'
    ) {
      try {
        const input = parseDrawQuery(url);
        const result = await runTestnetDraw({
          network: input.network,
          totalShares: input.totalShares,
          numWinners: input.numWinners,
          userSeed: input.userSeed,
          timeoutMs: 15_000,
        });
        json(res, 200, {
          ok: true,
          soft_fail: false,
          network: result.network,
          heights: result.heights,
          hashes: result.hashes,
          totalShares: result.totalShares,
          numWinners: result.numWinners,
          winners: result.winners,
          note: result.note,
          banner: result.banner,
        });
      } catch (e) {
        if (e instanceof NetworkError) {
          json(res, 200, {
            ok: false,
            soft_fail: true,
            error: e.message,
            note: 'Explorer unreachable; code path is real. Retry when online.',
          });
          return;
        }
        const msg = e instanceof Error ? e.message : String(e);
        json(res, 400, { ok: false, soft_fail: false, error: msg });
      }
      return;
    }

    json(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    json(res, 500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(TESTNET_BANNER);
  console.log(`SatsTogether web listening on http://${HOST}:${PORT}`);
  console.log(`PUBLIC_URL=${PUBLIC_URL}`);
});
