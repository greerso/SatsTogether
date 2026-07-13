/**
 * In-memory multi-session store for the prototype web UI.
 * Ephemeral: restarts wipe state. Not custody. Not multi-instance durable.
 *
 * Eviction: LRU via Map insertion order (touch on access).
 * New-session rate limit is enforced in web/server.ts (ST-5).
 */

import { createHash, randomUUID } from 'node:crypto';
import {
  ShareLedger,
  DEFAULT_SATS_PER_SHARE,
  type LedgerSnapshot,
  type AccountId,
} from '../sim/ledger.ts';

export interface SeedCommit {
  hashHex: string;
  at: number;
}

export interface SessionState {
  ledger: ShareLedger;
  seedCommit?: SeedCommit;
}

/** Map insertion order = LRU: first key is least recently used. */
const sessions = new Map<string, SessionState>();

export const MAX_SESSIONS = Math.max(
  10,
  Number(process.env.SESSION_MAX || 500) || 500,
);

function emptySession(): SessionState {
  return { ledger: new ShareLedger() };
}

/** Move id to most-recently-used end. */
function touch(id: string, state: SessionState) {
  sessions.delete(id);
  sessions.set(id, state);
}

function evictOldest() {
  const oldest = sessions.keys().next().value;
  if (oldest !== undefined) sessions.delete(oldest);
}

export function hasSession(sessionId: string | undefined): boolean {
  return typeof sessionId === 'string' && sessionId.length > 0 && sessions.has(sessionId);
}

export function sessionCount(): number {
  return sessions.size;
}

/** Test helper — clear all sessions. */
export function clearAllSessionsForTests() {
  sessions.clear();
}

/** Test helper — LRU key order (oldest first). */
export function sessionIdsOldestFirstForTests(): string[] {
  return [...sessions.keys()];
}

export function getOrCreateSession(sessionId: string | undefined): { id: string; state: SessionState } {
  if (sessionId && sessions.has(sessionId)) {
    const state = sessions.get(sessionId)!;
    touch(sessionId, state);
    return { id: sessionId, state };
  }

  if (sessions.size >= MAX_SESSIONS) {
    evictOldest();
  }

  const id = randomUUID();
  const state = emptySession();
  sessions.set(id, state);
  return { id, state };
}

export function resetSession(sessionId: string): SessionState {
  const state = emptySession();
  touch(sessionId, state);
  return state;
}

export function setSessionState(sessionId: string, state: SessionState) {
  touch(sessionId, state);
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function commitSeed(state: SessionState, seed: string): SeedCommit {
  if (!seed) throw new Error('seed required');
  const commit: SeedCommit = { hashHex: sha256Hex(seed), at: Date.now() };
  state.seedCommit = commit;
  return commit;
}

export function clearSeedCommit(state: SessionState) {
  delete state.seedCommit;
}

/** If a commit exists, seed must hash-match. When `required`, missing commit fails. */
export function assertSeedReveal(
  state: SessionState,
  seed: string,
  opts?: { required?: boolean },
): void {
  if (!state.seedCommit) {
    if (opts?.required) {
      throw new Error('seed commit required before draw — POST /api/session/commit first (commit-reveal)');
    }
    return;
  }
  const h = sha256Hex(seed);
  if (h !== state.seedCommit.hashHex) {
    throw new Error('seed does not match commitment (commit-reveal)');
  }
}

// Node types optional under strip-types; avoid NodeJS.ProcessEnv in public API.
export function seedCommitRequired(
  publicUrl: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): boolean {
  if (env.REQUIRE_SEED_COMMIT === '0' || env.REQUIRE_SEED_COMMIT === 'false') return false;
  if (env.REQUIRE_SEED_COMMIT === '1' || env.REQUIRE_SEED_COMMIT === 'true') return true;
  return publicUrl.startsWith('https://');
}

export function snapshotJson(ledger: ShareLedger, seedCommit?: SeedCommit) {
  const s: LedgerSnapshot = ledger.snapshot();
  return {
    satsPerShare: ledger.satsPerShare.toString(),
    totalShares: s.totalShares.toString(),
    totalPrincipalSats: s.totalPrincipalSats.toString(),
    yieldPoolSats: s.yieldPoolSats.toString(),
    nextShareIndex: s.nextShareIndex.toString(),
    epoch: s.epoch,
    claimBalances: Object.fromEntries(
      Object.entries(s.claimBalances).map(([k, v]) => [k, v.toString()]),
    ),
    seedCommit: seedCommit
      ? { hashHex: seedCommit.hashHex, at: seedCommit.at }
      : null,
    positions: s.positions.map(p => ({
      account: p.account,
      startIndex: p.startIndex.toString(),
      shareCount: p.shareCount.toString(),
      principalSats: p.principalSats.toString(),
      segments: p.segments.map(seg => ({
        startIndex: seg.startIndex.toString(),
        shareCount: seg.shareCount.toString(),
      })),
    })),
    draws: s.draws.map(d => ({
      epoch: d.epoch,
      winners: d.winners.map(String),
      winnerDetails: d.winnerDetails.map(w => ({
        index: w.index.toString(),
        account: w.account,
      })),
      byAccount: Object.fromEntries(
        Object.entries(d.byAccount).map(([k, v]) => [k, v.toString()]),
      ),
      prizePerWinner: d.prizePerWinner.toString(),
      yieldAvailable: d.yieldAvailable.toString(),
      allocated: d.allocated.toString(),
    })),
  };
}

export type SnapshotJson = ReturnType<typeof snapshotJson>;

export function ledgerFromSnapshotJson(data: SnapshotJson): ShareLedger {
  const satsPerShare = BigInt(data.satsPerShare || String(DEFAULT_SATS_PER_SHARE));
  const snap: LedgerSnapshot = {
    totalShares: BigInt(data.totalShares),
    totalPrincipalSats: BigInt(data.totalPrincipalSats),
    yieldPoolSats: BigInt(data.yieldPoolSats),
    nextShareIndex: BigInt(data.nextShareIndex),
    epoch: Number(data.epoch) || 0,
    positions: (data.positions || []).map(p => ({
      account: p.account as AccountId,
      startIndex: BigInt(p.startIndex),
      shareCount: BigInt(p.shareCount),
      principalSats: BigInt(p.principalSats),
      segments: (p.segments || []).map(seg => ({
        startIndex: BigInt(seg.startIndex),
        shareCount: BigInt(seg.shareCount),
      })),
    })),
    draws: (data.draws || []).map(d => ({
      epoch: d.epoch,
      winners: d.winners.map((w: string) => BigInt(w)),
      winnerDetails: (d.winnerDetails || []).map(w => ({
        index: BigInt(w.index),
        account: w.account as AccountId,
      })),
      byAccount: Object.fromEntries(
        Object.entries(d.byAccount || {}).map(([k, v]) => [k, BigInt(v as string)]),
      ),
      prizePerWinner: BigInt(d.prizePerWinner),
      yieldAvailable: BigInt(d.yieldAvailable),
      allocated: BigInt(d.allocated),
    })),
    claimBalances: Object.fromEntries(
      Object.entries(data.claimBalances || {}).map(([k, v]) => [k, BigInt(v as string)]),
    ),
  };
  return ShareLedger.restore(snap, satsPerShare);
}
