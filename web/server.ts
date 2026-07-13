/**
 * SatsTogether Coolify web service — interactive prototype ledger + testnet draw.
 *
 * PORT default 3000. TESTNET tooling only. Not mainnet, not audited, no real funds.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NetworkError } from '../testnet/block-hash.ts';
import { fetchAdjacentBlockHashes, parseUserSeed } from '../testnet/block-hash.ts';
import { runTestnetDraw, TESTNET_BANNER } from '../testnet/draw-from-chain.ts';
import type { ChainNetwork } from '../testnet/block-hash.ts';
import {
  getOrCreateSession,
  resetSession,
  snapshotJson,
  commitSeed,
  clearSeedCommit,
  assertSeedReveal,
  ledgerFromSnapshotJson,
  setSessionState,
  type SnapshotJson,
} from './session-store.ts';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const COOKIE = 'st_session';

/** Simple per-IP demo throttle (in-memory, best-effort). */
const demoHits = new Map<string, number>();
const DEMO_COOLDOWN_MS = 15_000;

function clientIp(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0]!.trim();
  return req.socket.remoteAddress || 'unknown';
}

function demoAllowed(req: IncomingMessage): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const last = demoHits.get(ip) || 0;
  if (now - last < DEMO_COOLDOWN_MS) return false;
  demoHits.set(ip, now);
  return true;
}

// Explicit static allowlist — no filesystem passthrough (no ../ traversal).
const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), 'public');
const STATIC_FILES: Record<string, { file: string; type: string }> = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' },
  '/robots.txt': { file: 'robots.txt', type: 'text/plain; charset=utf-8' },
};

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

function sessionFrom(req: IncomingMessage) {
  const cookies = parseCookies(req);
  return getOrCreateSession(cookies[COOKIE]);
}

function snap(state: { ledger: import('./session-store.ts').SessionState['ledger']; seedCommit?: import('./session-store.ts').SeedCommit }) {
  return snapshotJson(state.ledger, state.seedCommit);
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
    const staticEntry = req.method === 'GET' ? STATIC_FILES[url.pathname] : undefined;
    if (staticEntry) {
      const data = await readFile(join(PUBLIC_DIR, staticEntry.file));
      res.writeHead(200, { 'content-type': staticEntry.type, 'cache-control': 'no-store' });
      res.end(data);
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
          'Claim credits are sim-only (not Lightning delivery)',
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
          '/api/session/demo',
          '/api/session/claim',
          '/api/session/commit',
          '/api/session/export',
          '/api/session/import',
          '/api/testnet/draw',
        ],
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/session') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
      json(res, 200, { ok: true, sessionId: id, snapshot: snap(state) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/reset') {
      const cookies = parseCookies(req);
      const { id } = getOrCreateSession(cookies[COOKIE]);
      const state = resetSession(id);
      json(res, 200, { ok: true, sessionId: id, snapshot: snap(state) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/deposit') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
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
            segments: position.segments.map(s => ({
              startIndex: s.startIndex.toString(),
              shareCount: s.shareCount.toString(),
            })),
          },
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/accrue') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const amountSats = parseBigIntField(body.amountSats, 'amountSats');
      ledger.accrueYield(amountSats);
      json(res, 200, { ok: true, sessionId: id, snapshot: snap(state) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/withdraw') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
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
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/draw') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
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
        assertSeedReveal(state, userSeed);
        const chain = await fetchAdjacentBlockHashes({ network, timeoutMs: 15_000 });
        const seed = parseUserSeed(userSeed);
        const draw = ledger.draw(chain.blockHashN, chain.blockHashN1, seed, numWinners);
        clearSeedCommit(state);
        const winnerDetails = draw.winnerDetails.map(w => ({
          index: w.index.toString(),
          account: w.account,
        }));
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
              winnerDetails,
              byAccount: Object.fromEntries(
                Object.entries(draw.byAccount).map(([k, v]) => [k, v.toString()]),
              ),
              prizePerWinner: draw.prizePerWinner.toString(),
              yieldAvailable: draw.yieldAvailable.toString(),
              allocated: draw.allocated.toString(),
            },
            snapshot: snap(state),
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
              snapshot: snap(state),
            },
            id,
          );
          return;
        }
        throw e;
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/claim') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const account = String(body.account || '').trim();
      const out = ledger.claim(account);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          claimedSats: out.claimedSats.toString(),
          note: 'Sim claim drain only — no Lightning/on-chain delivery',
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/commit') {
      const { id, state } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const seed = String(body.seed || '');
      const commit = commitSeed(state, seed);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          commit,
          note: 'Draw must reveal the same seed string. Not production commit-reveal.',
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/session/export') {
      const { id, state } = sessionFrom(req);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          exportedAt: new Date().toISOString(),
          version: '0.1.0-prototype',
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/import') {
      const { id } = sessionFrom(req);
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const raw = (body.snapshot || body) as SnapshotJson;
      if (!raw || typeof raw !== 'object' || !('nextShareIndex' in raw)) {
        json(res, 400, { ok: false, error: 'snapshot object required' }, id);
        return;
      }
      const ledger = ledgerFromSnapshotJson(raw);
      const seedCommit =
        raw.seedCommit && typeof raw.seedCommit === 'object'
          ? {
              hashHex: String((raw.seedCommit as { hashHex?: string }).hashHex || ''),
              at: Number((raw.seedCommit as { at?: number }).at) || Date.now(),
            }
          : undefined;
      if (seedCommit && !seedCommit.hashHex) {
        json(res, 400, { ok: false, error: 'invalid seedCommit' }, id);
        return;
      }
      const state = { ledger, seedCommit: seedCommit?.hashHex ? seedCommit : undefined };
      setSessionState(id, state);
      json(res, 200, { ok: true, sessionId: id, snapshot: snap(state) }, id);
      return;
    }

    // One-click demo: reset → multi-user deposits → yield → testnet draw
    if (req.method === 'POST' && url.pathname === '/api/session/demo') {
      if (!demoAllowed(req)) {
        json(res, 429, {
          ok: false,
          error: 'demo cooldown — wait ~15s (protects public explorer + session churn)',
        });
        return;
      }
      const cookies = parseCookies(req);
      const { id } = getOrCreateSession(cookies[COOKIE]);
      const state = resetSession(id);
      const ledger = state.ledger;
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const networkRaw = String(body.network || 'testnet');
      if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
        json(res, 400, { ok: false, error: 'network must be testnet or signet' }, id);
        return;
      }
      const network = networkRaw as ChainNetwork;
      try {
        ledger.deposit('alice', 5_000_000n);
        ledger.deposit('bob', 2_000_000n);
        ledger.deposit('carol', 1_000_000n);
        ledger.deposit('alice', 1_000_000n); // top-up
        ledger.accrueYield(50_000n);
        const chain = await fetchAdjacentBlockHashes({ network, timeoutMs: 15_000 });
        const seed = parseUserSeed(String(body.userSeed || 'overnight-demo'));
        const numWinners = Number(body.numWinners ?? 3);
        const draw = ledger.draw(
          chain.blockHashN,
          chain.blockHashN1,
          seed,
          Number.isInteger(numWinners) && numWinners >= 0 ? numWinners : 3,
        );
        const winnerDetails = draw.winnerDetails.map(w => ({
          index: w.index.toString(),
          account: w.account,
        }));
        json(
          res,
          200,
          {
            ok: true,
            soft_fail: false,
            sessionId: id,
            steps: [
              'reset session',
              'deposit alice 5M + top-up 1M',
              'deposit bob 2M',
              'deposit carol 1M',
              'accrue 50k yield',
              `draw ${network} tip hashes`,
            ],
            chain: {
              network: chain.network,
              heights: { n: chain.heightN, n1: chain.heightN1 },
              hashes: { n: chain.hashNHex, n1: chain.hashN1Hex },
            },
            draw: {
              epoch: draw.epoch,
              winners: draw.winners.map(String),
              winnerDetails,
              byAccount: Object.fromEntries(
                Object.entries(draw.byAccount).map(([k, v]) => [k, v.toString()]),
              ),
              prizePerWinner: draw.prizePerWinner.toString(),
              yieldAvailable: draw.yieldAvailable.toString(),
              allocated: draw.allocated.toString(),
            },
            snapshot: snap(state),
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
              note: 'Deposits + yield applied; draw soft-failed (explorer).',
              snapshot: snap(state),
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
