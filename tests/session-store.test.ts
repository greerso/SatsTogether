/**
 * Session store unit tests (ephemeral ledger map).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOrCreateLedger, resetLedger, snapshotJson } from '../web/session-store.ts';

describe('web/session-store', () => {
  it('creates new session when missing', () => {
    const a = getOrCreateLedger(undefined);
    assert.ok(a.id.length > 10);
    assert.equal(a.ledger.totalShares, 0n);
  });

  it('reuses session id', () => {
    const a = getOrCreateLedger(undefined);
    a.ledger.deposit('bob', 1000n);
    const b = getOrCreateLedger(a.id);
    assert.equal(b.id, a.id);
    assert.equal(b.ledger.totalShares, 1n);
  });

  it('reset clears ledger for id', () => {
    const a = getOrCreateLedger(undefined);
    a.ledger.deposit('carol', 2000n);
    const ledger = resetLedger(a.id);
    assert.equal(ledger.totalShares, 0n);
    const snap = snapshotJson(ledger);
    assert.equal(snap.totalShares, '0');
    assert.equal(snap.positions.length, 0);
  });

  it('snapshotJson stringifies bigints', () => {
    const { ledger } = getOrCreateLedger(undefined);
    ledger.deposit('dave', 3000n);
    ledger.accrueYield(100n);
    const s = snapshotJson(ledger);
    assert.equal(s.totalPrincipalSats, '3000');
    assert.equal(s.yieldPoolSats, '100');
    assert.equal(s.positions[0]?.shareCount, '3');
  });
});
