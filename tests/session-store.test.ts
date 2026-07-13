/**
 * Session store unit tests (ephemeral ledger map + commit/export).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrCreateSession,
  resetSession,
  snapshotJson,
  commitSeed,
  assertSeedReveal,
  sha256Hex,
  ledgerFromSnapshotJson,
} from '../web/session-store.ts';
import { sampleHashes } from '../sim/draw.ts';

describe('web/session-store', () => {
  it('creates new session when missing', () => {
    const a = getOrCreateSession(undefined);
    assert.ok(a.id.length > 10);
    assert.equal(a.state.ledger.totalShares, 0n);
  });

  it('reuses session id', () => {
    const a = getOrCreateSession(undefined);
    a.state.ledger.deposit('bob', 1000n);
    const b = getOrCreateSession(a.id);
    assert.equal(b.id, a.id);
    assert.equal(b.state.ledger.totalShares, 1n);
  });

  it('reset clears ledger for id', () => {
    const a = getOrCreateSession(undefined);
    a.state.ledger.deposit('carol', 2000n);
    const state = resetSession(a.id);
    assert.equal(state.ledger.totalShares, 0n);
    const snap = snapshotJson(state.ledger);
    assert.equal(snap.totalShares, '0');
    assert.equal(snap.positions.length, 0);
  });

  it('snapshotJson stringifies bigints', () => {
    const { state } = getOrCreateSession(undefined);
    state.ledger.deposit('dave', 3000n);
    state.ledger.accrueYield(100n);
    const s = snapshotJson(state.ledger);
    assert.equal(s.totalPrincipalSats, '3000');
    assert.equal(s.yieldPoolSats, '100');
    assert.equal(s.positions[0]?.shareCount, '3');
  });

  it('commit-reveal enforces seed match', () => {
    const { state } = getOrCreateSession(undefined);
    commitSeed(state, 'secret-seed');
    assert.throws(() => assertSeedReveal(state, 'wrong'), /commitment/);
    assert.doesNotThrow(() => assertSeedReveal(state, 'secret-seed'));
    assert.equal(state.seedCommit?.hashHex, sha256Hex('secret-seed'));
  });

  it('export/import round-trips ledger + claims', () => {
    const { state } = getOrCreateSession(undefined);
    const ledger = state.ledger;
    ledger.deposit('alice', 2000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    ledger.draw(a, b, c, 1);
    const json = snapshotJson(ledger);
    const restored = ledgerFromSnapshotJson(json);
    assert.equal(restored.totalShares, ledger.totalShares);
    assert.equal(restored.yieldPool, ledger.yieldPool);
    assert.equal(restored.snapshot().epoch, ledger.snapshot().epoch);
    assert.equal(restored.claimBalance('alice'), ledger.claimBalance('alice'));
  });

  it('escapes account injection surface in snapshot strings (no HTML)', () => {
    const { state } = getOrCreateSession(undefined);
    const evil = '<img src=x onerror=alert(1)>';
    state.ledger.deposit(evil, 1000n);
    const s = snapshotJson(state.ledger);
    assert.equal(s.positions[0]?.account, evil);
    // UI must esc(); raw snapshot still holds the string — document contract.
    assert.ok(s.positions[0]?.account.includes('<'));
  });
});
