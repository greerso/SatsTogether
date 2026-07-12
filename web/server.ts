/**
 * SatsTogether Coolify web service — interactive prototype ledger + testnet draw.
 *
 * PORT default 3000. TESTNET tooling only. Not mainnet, not audited, no real funds.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { NetworkError } from '../testnet/block-hash.ts';
import { fetchAdjacentBlockHashes, parseUserSeed } from '../testnet/block-hash.ts';
import { runTestnetDraw, TESTNET_BANNER } from '../testnet/draw-from-chain.ts';
import type { ChainNetwork } from '../testnet/block-hash.ts';
import { getOrCreateLedger, resetLedger, snapshotJson } from './session-store.ts';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const COOKIE = 'st_session';

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseCookies(req: IncomingMessage): Record<string, string> {
  const raw = req.headers.cookie || '';
  const out: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

function setSessionCookie(res: ServerResponse, id: string) {
  res.setHeader(
    'set-cookie',
    `${COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  );
}

function json(res: ServerResponse, status: number, body: unknown, sessionId?: string) {
  if (sessionId) setSessionCookie(res, sessionId);
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(data);
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function landingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SatsTogether — Prototype</title>
  <style>
    :root { color-scheme: dark; --bg:#0b0f14; --card:#141b24; --text:#e8eef6; --muted:#8b9bb0; --accent:#f7931a; --ok:#3dd68c; --line:#243041; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    main { max-width: 840px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    h1 { font-size: 1.85rem; margin: 0 0 0.25rem; color: var(--accent); }
    h2 { font-size: 1.05rem; margin: 0 0 0.5rem; }
    .banner { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.68rem; background:#1a1010; border:1px solid #5c2a2a; color:#ffb4b4; padding:0.9rem; border-radius:8px; margin:1.1rem 0; overflow-x:auto; }
    .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:1.15rem; margin:1rem 0; }
    .row { display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; }
    @media (max-width:640px){ .row { grid-template-columns: 1fr; } }
    label { display:block; font-size:0.82rem; color:var(--muted); margin-top:0.55rem; }
    input, select, button { width:100%; margin-top:0.3rem; padding:0.55rem 0.7rem; border-radius:8px; border:1px solid #334155; background:#0f1520; color:var(--text); font-size:0.95rem; }
    button { background:var(--accent); color:#111; border:none; font-weight:700; cursor:pointer; margin-top:0.85rem; }
    button.secondary { background:#1e293b; color:var(--text); border:1px solid #334155; }
    button:disabled { opacity:0.55; cursor:wait; }
    pre, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:0.78rem; }
    pre { background:#0a0e14; border-radius:8px; padding:0.85rem; overflow:auto; border:1px solid var(--line); max-height: 280px; }
    a { color: var(--accent); }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .pill { display:inline-block; padding:0.15rem 0.5rem; border-radius:999px; background:#2a1a08; color:var(--accent); font-size:0.75rem; font-weight:600; }
    .stats { display:grid; grid-template-columns: repeat(4,1fr); gap:0.5rem; margin-top:0.75rem; }
    @media (max-width:640px){ .stats { grid-template-columns: 1fr 1fr; } }
    .stat { background:#0f1520; border:1px solid var(--line); border-radius:8px; padding:0.6rem; }
    .stat b { display:block; color:var(--accent); font-size:1.05rem; }
    .stat span { color:var(--muted); font-size:0.75rem; }
    table { width:100%; border-collapse: collapse; font-size:0.85rem; margin-top:0.5rem; }
    th, td { text-align:left; padding:0.4rem 0.35rem; border-bottom:1px solid var(--line); }
    th { color:var(--muted); font-weight:600; }
    .ok { color: var(--ok); }
    .err { color: #ff8e8e; }
  </style>
</head>
<body>
  <main>
    <span class="pill">PROTOTYPE · EPHEMERAL SESSION · TESTNET HASHES</span>
    <h1>SatsTogether</h1>
    <p class="muted">Interactive off-chain share ledger + real testnet block hashes for draws. Not mainnet. Not audited. No real BTC custody.</p>
    <div class="banner">${htmlEscape(TESTNET_BANNER)}</div>

    <div class="card">
      <h2>Pool snapshot</h2>
      <p class="muted">In-memory session only (cookie). Restart or “Reset” wipes it. 1 share = 1000 sats principal (sim rule).</p>
      <div class="stats" id="stats"></div>
      <div class="row">
        <div>
          <h3 class="muted" style="font-size:0.85rem;margin:0.75rem 0 0;">Positions</h3>
          <div id="positions" class="mono muted">Loading…</div>
        </div>
        <div>
          <h3 class="muted" style="font-size:0.85rem;margin:0.75rem 0 0;">Draw history</h3>
          <div id="draws" class="mono muted">—</div>
        </div>
      </div>
      <button type="button" class="secondary" id="btn-refresh">Refresh</button>
      <button type="button" class="secondary" id="btn-reset">Reset session</button>
    </div>

    <div class="card">
      <h2>1 · Deposit principal (sim)</h2>
      <div class="row">
        <label>Account id <input id="dep-account" value="alice" /></label>
        <label>Principal sats (×1000) <input id="dep-sats" type="number" min="1000" step="1000" value="5000" /></label>
      </div>
      <button type="button" id="btn-deposit">Deposit</button>
    </div>

    <div class="card">
      <h2>2 · Accrue yield (sim)</h2>
      <p class="muted">Mock verified yield into the prize pool. Production would require YieldProofVerifier.</p>
      <label>Yield sats <input id="acc-sats" type="number" min="0" value="1000" /></label>
      <button type="button" id="btn-accrue">Accrue yield</button>
    </div>

    <div class="card">
      <h2>3 · Draw with testnet block hashes</h2>
      <p class="muted">Fetches tip-1 + tip from mempool.space, then runs ledger.draw (offline model). Winners are share indices; burned indices skip allocation.</p>
      <div class="row">
        <label>Network
          <select id="network">
            <option value="testnet" selected>testnet</option>
            <option value="signet">signet</option>
          </select>
        </label>
        <label>Num winners <input id="winners" type="number" min="0" value="3" /></label>
      </div>
      <label>User seed (hex64 or demo string) <input id="seed" value="satstogether-web-demo" /></label>
      <button type="button" id="btn-draw">Draw from chain</button>
    </div>

    <div class="card">
      <h2>4 · Withdraw principal (sim)</h2>
      <label>Account id <input id="wd-account" value="alice" /></label>
      <button type="button" id="btn-withdraw">Withdraw all</button>
    </div>

    <div class="card">
      <h2>Log</h2>
      <pre id="log">Ready.</pre>
    </div>

    <p class="muted">API: <a href="/health">/health</a> · <a href="/api/status">/api/status</a> · <a href="/api/session">/api/session</a> · <a href="https://github.com/greerso/SatsTogether">GitHub</a></p>
  </main>
  <script>
    const logEl = document.getElementById('log');
    function log(msg, ok) {
      const t = new Date().toISOString().slice(11,19);
      logEl.textContent = '[' + t + '] ' + msg + '\\n' + logEl.textContent;
      logEl.className = ok === false ? 'err' : (ok === true ? 'ok' : '');
    }
    async function api(path, opts) {
      const res = await fetch(path, Object.assign({ credentials: 'same-origin', headers: { 'content-type': 'application/json' } }, opts || {}));
      const body = await res.json();
      if (!res.ok || body.ok === false && !body.soft_fail) {
        throw new Error(body.error || ('HTTP ' + res.status));
      }
      return body;
    }
    function render(snap) {
      document.getElementById('stats').innerHTML = [
        ['Shares', snap.totalShares],
        ['Principal', snap.totalPrincipalSats + ' sats'],
        ['Yield pool', snap.yieldPoolSats + ' sats'],
        ['Epoch', String(snap.epoch)],
      ].map(([k,v]) => '<div class="stat"><b>'+v+'</b><span>'+k+'</span></div>').join('');
      const pos = snap.positions || [];
      document.getElementById('positions').innerHTML = pos.length
        ? '<table><tr><th>acct</th><th>start</th><th>n</th><th>principal</th></tr>' +
          pos.map(p => '<tr><td>'+p.account+'</td><td>'+p.startIndex+'</td><td>'+p.shareCount+'</td><td>'+p.principalSats+'</td></tr>').join('') +
          '</table>'
        : 'No positions';
      const draws = snap.draws || [];
      document.getElementById('draws').innerHTML = draws.length
        ? '<table><tr><th>ep</th><th>winners</th><th>alloc</th></tr>' +
          draws.slice().reverse().map(d => '<tr><td>'+d.epoch+'</td><td>'+d.winners.join(',')+'</td><td>'+d.allocated+'</td></tr>').join('') +
          '</table>'
        : 'No draws yet';
    }
    async function refresh() {
      const body = await api('/api/session');
      render(body.snapshot);
      return body;
    }
    document.getElementById('btn-refresh').onclick = async () => {
      try { await refresh(); log('Refreshed', true); } catch (e) { log(String(e), false); }
    };
    document.getElementById('btn-reset').onclick = async () => {
      try {
        const body = await api('/api/session/reset', { method: 'POST', body: '{}' });
        render(body.snapshot);
        log('Session reset', true);
      } catch (e) { log(String(e), false); }
    };
    document.getElementById('btn-deposit').onclick = async () => {
      try {
        const body = await api('/api/session/deposit', {
          method: 'POST',
          body: JSON.stringify({
            account: document.getElementById('dep-account').value,
            principalSats: document.getElementById('dep-sats').value,
          }),
        });
        render(body.snapshot);
        log('Deposited ' + body.position.principalSats + ' sats for ' + body.position.account, true);
      } catch (e) { log(String(e), false); }
    };
    document.getElementById('btn-accrue').onclick = async () => {
      try {
        const body = await api('/api/session/accrue', {
          method: 'POST',
          body: JSON.stringify({ amountSats: document.getElementById('acc-sats').value }),
        });
        render(body.snapshot);
        log('Accrued yield; pool=' + body.snapshot.yieldPoolSats, true);
      } catch (e) { log(String(e), false); }
    };
    document.getElementById('btn-withdraw').onclick = async () => {
      try {
        const body = await api('/api/session/withdraw', {
          method: 'POST',
          body: JSON.stringify({ account: document.getElementById('wd-account').value }),
        });
        render(body.snapshot);
        log('Withdrew ' + body.principalSats + ' sats principal', true);
      } catch (e) { log(String(e), false); }
    };
    document.getElementById('btn-draw').onclick = async () => {
      try {
        log('Fetching testnet tip hashes…');
        const body = await api('/api/session/draw', {
          method: 'POST',
          body: JSON.stringify({
            network: document.getElementById('network').value,
            numWinners: Number(document.getElementById('winners').value),
            userSeed: document.getElementById('seed').value,
          }),
        });
        if (body.soft_fail) {
          log('SOFT FAIL network: ' + body.error, false);
          return;
        }
        render(body.snapshot);
        log('Draw epoch ' + body.draw.epoch + ' winners=[' + body.draw.winners.join(',') + '] heights ' + body.chain.heights.n + '/' + body.chain.heights.n1, true);
      } catch (e) { log(String(e), false); }
    };
    refresh().catch(e => log(String(e), false));
  </script>
</body>
</html>`;
}

function sessionFrom(req: IncomingMessage) {
  const cookies = parseCookies(req);
  return getOrCreateLedger(cookies[COOKIE]);
}

function parseBigIntField(v: unknown, name: string): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number' && Number.isInteger(v)) return BigInt(v);
  if (typeof v === 'string' && /^-?\d+$/.test(v)) return BigInt(v);
  throw new Error(`${name} must be an integer string`);
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
        phase: 'P2 interactive ledger + testnet draw',
        public_url: PUBLIC_URL,
        honesty: [
          'Not mainnet',
          'Not audited',
          'Ephemeral in-memory sessions',
          'Offline draw model (placeholder_mix)',
          'No real-funds / vaults / BitVM2 circuit',
        ],
        endpoints: [
          '/',
          '/health',
          '/api/status',
          '/api/session',
          '/api/session/deposit',
          '/api/session/accrue',
          '/api/session/withdraw',
          '/api/session/draw',
          '/api/testnet/draw',
        ],
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/session') {
      const { id, ledger } = sessionFrom(req);
      json(res, 200, { ok: true, sessionId: id, snapshot: snapshotJson(ledger) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/reset') {
      const cookies = parseCookies(req);
      const { id } = getOrCreateLedger(cookies[COOKIE]);
      const ledger = resetLedger(id);
      json(res, 200, { ok: true, sessionId: id, snapshot: snapshotJson(ledger) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/deposit') {
      const { id, ledger } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const account = String(body.account || '').trim();
      const principalSats = parseBigIntField(body.principalSats, 'principalSats');
      const position = ledger.deposit(account, principalSats);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          position: {
            account: position.account,
            startIndex: position.startIndex.toString(),
            shareCount: position.shareCount.toString(),
            principalSats: position.principalSats.toString(),
          },
          snapshot: snapshotJson(ledger),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/accrue') {
      const { id, ledger } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const amountSats = parseBigIntField(body.amountSats, 'amountSats');
      ledger.accrueYield(amountSats);
      json(res, 200, { ok: true, sessionId: id, snapshot: snapshotJson(ledger) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/withdraw') {
      const { id, ledger } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const account = String(body.account || '').trim();
      const out = ledger.withdraw(account);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          principalSats: out.principalSats.toString(),
          snapshot: snapshotJson(ledger),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/draw') {
      const { id, ledger } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const networkRaw = String(body.network || 'testnet');
      if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
        json(res, 400, { ok: false, error: 'network must be testnet or signet' }, id);
        return;
      }
      const network = networkRaw as ChainNetwork;
      const numWinners = Number(body.numWinners ?? 3);
      if (!Number.isInteger(numWinners) || numWinners < 0) {
        json(res, 400, { ok: false, error: 'numWinners must be non-negative integer' }, id);
        return;
      }
      const userSeed = String(body.userSeed || 'satstogether-web-demo');
      try {
        const chain = await fetchAdjacentBlockHashes({ network, timeoutMs: 15_000 });
        const seed = parseUserSeed(userSeed);
        const draw = ledger.draw(chain.blockHashN, chain.blockHashN1, seed, numWinners);
        json(
          res,
          200,
          {
            ok: true,
            soft_fail: false,
            sessionId: id,
            chain: {
              network: chain.network,
              heights: { n: chain.heightN, n1: chain.heightN1 },
              hashes: { n: chain.hashNHex, n1: chain.hashN1Hex },
            },
            draw: {
              epoch: draw.epoch,
              winners: draw.winners.map(String),
              prizePerWinner: draw.prizePerWinner.toString(),
              yieldAvailable: draw.yieldAvailable.toString(),
              allocated: draw.allocated.toString(),
            },
            snapshot: snapshotJson(ledger),
          },
          id,
        );
      } catch (e) {
        if (e instanceof NetworkError) {
          json(
            res,
            200,
            {
              ok: false,
              soft_fail: true,
              error: e.message,
              snapshot: snapshotJson(ledger),
            },
            id,
          );
          return;
        }
        throw e;
      }
      return;
    }

    // Legacy simple draw (no ledger)
    if (
      (req.method === 'GET' || req.method === 'POST') &&
      url.pathname === '/api/testnet/draw'
    ) {
      try {
        const networkRaw = url.searchParams.get('network') || 'testnet';
        if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
          throw new Error('network must be testnet or signet (mainnet refused)');
        }
        const sharesStr = url.searchParams.get('shares') || '1000';
        if (!/^\d+$/.test(sharesStr) || BigInt(sharesStr) <= 0n) {
          throw new Error('shares must be a positive integer');
        }
        const winners = Number(url.searchParams.get('winners') || '5');
        if (!Number.isInteger(winners) || winners < 0) {
          throw new Error('winners must be a non-negative integer');
        }
        const seed = url.searchParams.get('seed') || 'satstogether-web-demo';
        const result = await runTestnetDraw({
          network: networkRaw as ChainNetwork,
          totalShares: BigInt(sharesStr),
          numWinners: winners,
          userSeed: seed,
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
    const msg = e instanceof Error ? e.message : String(e);
    json(res, 400, { ok: false, error: msg });
  }
});

server.listen(PORT, HOST, () => {
  console.log(TESTNET_BANNER);
  console.log(`SatsTogether web listening on http://${HOST}:${PORT}`);
  console.log(`PUBLIC_URL=${PUBLIC_URL}`);
});
