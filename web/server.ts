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
  seedCommitRequired,
  ledgerFromSnapshotJson,
  setSessionState,
  type SnapshotJson,
} from './session-store.ts';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const COOKIE = 'st_session';
const REQUIRE_COMMIT = seedCommitRequired(PUBLIC_URL);

/** Simple per-IP throttle (in-memory, best-effort). */
const rateHits = new Map<string, number>();
const DEMO_COOLDOWN_MS = 15_000;
const DRAW_COOLDOWN_MS = 3_000;
// Bound rateHits memory: an attacker rotating X-Forwarded-For mints a new key
// per request, so cap the map and prune expired (>= longest cooldown) entries.
const RATE_MAP_MAX = 10_000;
// Cap request bodies. Snapshots are small; reject oversized bodies before we
// buffer them (unauthenticated /import is otherwise a memory-exhaustion vector).
const MAX_BODY_BYTES = 1_000_000;

// Trust-boundary caps: unauthenticated callers must not pass unbounded numeric
// params. selectWinners' attempt budget scales with numWinners*shares, and the
// ledger mints one map entry per share — both are DoS vectors without a ceiling.
const MAX_WINNERS = 1_000;
const MAX_DRAW_SHARES = 1_000_000n; // legacy endpoint totalShares (no minting there)

function clientIp(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0]!.trim();
  return req.socket.remoteAddress || 'unknown';
}

function rateAllowed(req: IncomingMessage, key: string, cooldownMs: number): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  const mapKey = key + ':' + ip;
  const last = rateHits.get(mapKey) || 0;
  if (now - last < cooldownMs) return false;
  if (rateHits.size >= RATE_MAP_MAX) {
    // Deleting entries past the longest cooldown only resets an already-expired
    // throttle, so this is semantically safe and keeps the map bounded.
    for (const [k, t] of rateHits) {
      if (now - t >= DEMO_COOLDOWN_MS) rateHits.delete(k);
    }
  }
  rateHits.set(mapKey, now);
  return true;
}

function demoAllowed(req: IncomingMessage): boolean {
  return rateAllowed(req, 'demo', DEMO_COOLDOWN_MS);
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
  const secure = PUBLIC_URL.startsWith('https://') ? '; Secure' : '';
  res.setHeader(
    'set-cookie',
    `${COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`,
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
  let size = 0;
  for await (const c of req) {
    const chunk = c as Buffer;
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('request body too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function sessionFrom(req: IncomingMessage) {
  const cookies = parseCookies(req);
  return getOrCreateSession(cookies[COOKIE]);
}

function snap(state: { ledger: import('./session-store.ts').SessionState['ledger']; seedCommit?: import('./session-store.ts').SeedCommit }) {
  return snapshotJson(state.ledger, state.seedCommit);
}

function parseBigIntField(v: unknown, name: string, opts?: { min?: bigint; max?: bigint }): bigint {
  let n: bigint;
  if (typeof v === 'bigint') n = v;
  else if (typeof v === 'number' && Number.isInteger(v)) n = BigInt(v);
  else if (typeof v === 'string' && /^-?\d+$/.test(v)) n = BigInt(v);
  else throw new Error(`${name} must be an integer string`);
  if (opts?.min !== undefined && n < opts.min) {
    throw new Error(`${name} must be >= ${opts.min}`);
  }
  if (opts?.max !== undefined && n > opts.max) {
    throw new Error(`${name} must be <= ${opts.max}`);
  }
  return n;
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
          REQUIRE_COMMIT
            ? 'Seed commit-reveal required on HTTPS (session integrity only — not manipulation-resistant fairness)'
            : 'Seed commit optional (REQUIRE_SEED_COMMIT=0)',
          'Draw entropy is offline placeholder_mix; tip hashes are public (grindable seed)',
          'Claim credits are sim-only (not Lightning delivery)',
          'No real-funds / vaults / BitVM2 circuit',
          'Internal Claude review 2026-07-13 — not an external audit',
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
      const principalSats = parseBigIntField(body.principalSats, 'principalSats', {
        min: 1n,
        max: 1_000_000_000_000n, // 1e12 sats hard cap before share-space guard
      });
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
      const amountSats = parseBigIntField(body.amountSats, 'amountSats', { min: 0n });
      ledger.accrueYield(amountSats);
      json(res, 200, { ok: true, sessionId: id, snapshot: snap(state) }, id);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/withdraw') {
      const { id, state } = sessionFrom(req);
      const ledger = state.ledger;
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const account = String(body.account || '').trim();
      const amount =
        body.principalSats === undefined || body.principalSats === null || body.principalSats === ''
          ? undefined
          : parseBigIntField(body.principalSats, 'principalSats', { min: 1n });
      const out = ledger.withdraw(account, amount);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          principalSats: out.principalSats.toString(),
          remainingPrincipal: out.remainingPrincipal.toString(),
          snapshot: snap(state),
        },
        id,
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/session/draw') {
      if (!rateAllowed(req, 'draw', DRAW_COOLDOWN_MS)) {
        json(res, 429, { ok: false, error: 'draw cooldown — wait a few seconds' });
        return;
      }
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
      if (!Number.isInteger(numWinners) || numWinners < 0 || numWinners > MAX_WINNERS) {
        json(res, 400, { ok: false, error: `numWinners must be an integer in [0, ${MAX_WINNERS}]` }, id);
        return;
      }
      const userSeed = String(body.userSeed || 'satstogether-web-demo');
      try {
        assertSeedReveal(state, userSeed, { required: REQUIRE_COMMIT });
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
      const amount =
        body.amountSats === undefined || body.amountSats === null || body.amountSats === ''
          ? undefined
          : parseBigIntField(body.amountSats, 'amountSats', { min: 1n });
      const out = ledger.claim(account, amount);
      json(
        res,
        200,
        {
          ok: true,
          sessionId: id,
          claimedSats: out.claimedSats.toString(),
          remaining: out.remaining.toString(),
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
      if (!rateAllowed(req, 'import', DRAW_COOLDOWN_MS)) {
        json(res, 429, { ok: false, error: 'import cooldown — wait a few seconds' });
        return;
      }
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
      const body = JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>;
      const networkRaw = String(body.network || 'testnet');
      if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
        json(res, 400, { ok: false, error: 'network must be testnet or signet' });
        return;
      }
      const network = networkRaw as ChainNetwork;
      const cookies = parseCookies(req);
      const { id } = getOrCreateSession(cookies[COOKIE]);
      const state = resetSession(id);
      const ledger = state.ledger;
      try {
        ledger.deposit('alice', 5_000_000n);
        ledger.deposit('bob', 2_000_000n);
        ledger.deposit('carol', 1_000_000n);
        ledger.deposit('alice', 1_000_000n); // top-up
        ledger.accrueYield(50_000n);
        const chain = await fetchAdjacentBlockHashes({ network, timeoutMs: 15_000 });
        const seedStr = String(body.userSeed || 'overnight-demo');
        // Demo always commit-reveals so production HTTPS path stays consistent.
        commitSeed(state, seedStr);
        const seed = parseUserSeed(seedStr);
        assertSeedReveal(state, seedStr, { required: true });
        const numWinners = Number(body.numWinners ?? 3);
        const safeWinners =
          Number.isInteger(numWinners) && numWinners >= 0
            ? Math.min(numWinners, MAX_WINNERS)
            : 3;
        const draw = ledger.draw(chain.blockHashN, chain.blockHashN1, seed, safeWinners);
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
            steps: [
              'reset session',
              'deposit alice 5M + top-up 1M',
              'deposit bob 2M',
              'deposit carol 1M',
              'accrue 50k yield',
              'commit-reveal seed',
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
      if (!rateAllowed(req, 'legacy-draw', DRAW_COOLDOWN_MS)) {
        json(res, 429, { ok: false, error: 'draw cooldown — wait a few seconds' });
        return;
      }
      try {
        const networkRaw = url.searchParams.get('network') || 'testnet';
        if (networkRaw !== 'testnet' && networkRaw !== 'signet') {
          throw new Error('network must be testnet or signet (mainnet refused)');
        }
        const sharesStr = url.searchParams.get('shares') || '1000';
        if (!/^\d+$/.test(sharesStr) || BigInt(sharesStr) <= 0n || BigInt(sharesStr) > MAX_DRAW_SHARES) {
          throw new Error(`shares must be a positive integer <= ${MAX_DRAW_SHARES}`);
        }
        const winners = Number(url.searchParams.get('winners') || '5');
        if (!Number.isInteger(winners) || winners < 0 || winners > MAX_WINNERS) {
          throw new Error(`winners must be an integer in [0, ${MAX_WINNERS}]`);
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
