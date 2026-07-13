/**
 * In-memory multi-session ShareLedger store for the prototype web UI.
 * Ephemeral: restarts wipe state. Not custody. Not multi-instance durable.
 */

import { randomUUID } from 'node:crypto';
import { ShareLedger, type LedgerSnapshot } from '../sim/ledger.ts';

const sessions = new Map<string, ShareLedger>();
const MAX_SESSIONS = 500;

export function getOrCreateLedger(sessionId: string | undefined): { id: string; ledger: ShareLedger } {
  let id = sessionId && sessions.has(sessionId) ? sessionId : '';
  if (!id) {
    if (sessions.size >= MAX_SESSIONS) {
      const first = sessions.keys().next().value;
      if (first) sessions.delete(first);
    }
    id = randomUUID();
    sessions.set(id, new ShareLedger());
  }
  return { id, ledger: sessions.get(id)! };
}

export function resetLedger(sessionId: string): ShareLedger {
  const ledger = new ShareLedger();
  sessions.set(sessionId, ledger);
  return ledger;
}

export function snapshotJson(ledger: ShareLedger) {
  const s: LedgerSnapshot = ledger.snapshot();
  return {
    satsPerShare: ledger.satsPerShare.toString(),
    totalShares: s.totalShares.toString(),
    totalPrincipalSats: s.totalPrincipalSats.toString(),
    yieldPoolSats: s.yieldPoolSats.toString(),
    nextShareIndex: s.nextShareIndex.toString(),
    epoch: s.epoch,
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
      // Frozen at draw time (survives withdraw)
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
