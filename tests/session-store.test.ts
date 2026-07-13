/**
 * Session store unit tests (ephemeral ledger map + commit/export + LRU).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrCreateSession,
  resetSession,
  snapshotJson,
  commitSeed,
  assertSeedReveal,
  seedCommitRequired,
  sha256Hex,
  ledgerFromSnapshotJson,
  clearAllSessionsForTests,
  sessionIdsOldestFirstForTests,
  MAX_SESSIONS,
  hasSession,
} from '../web/session-store.ts';
import { sampleHashes } from '../sim/draw.ts';

describe('web/session-store', () => {
  it('creates new session when missing', () => {
    const a = getOrCreateSession(undefined);
    assert.ok(a.id.length > 10);
    assert.equal(a.state.ledger.totalShares, 0n);
  });

  it('reuses session id and LRU-touches', () => {
    clearAllSessionsForTests();
    const a = getOrCreateSession(undefined);
    a.state.ledger.deposit('bob', 1000n);
    const mid = getOrCreateSession(undefined);
    const b = getOrCreateSession(a.id);
    assert.equal(b.id, a.id);
    assert.equal(b.state.ledger.totalShares, 1n);
    // a should be MRU (last)
    const order = sessionIdsOldestFirstForTests();
    assert.equal(order[order.length - 1], a.id);
    assert.ok(order.includes(mid.id));
  });

  it('LRU evicts oldest when at capacity', () => {
    clearAllSessionsForTests();
    const ids: string[] = [];
    for (let i = 0; i < MAX_SESSIONS; i++) {
      ids.push(getOrCreateSession(undefined).id);
    }
    assert.equal(sessionIdsOldestFirstForTests().length, MAX_SESSIONS);
    const oldest = ids[0]!;
    assert.equal(hasSession(oldest), true);
    getOrCreateSession(ids[1]);
    const neu = getOrCreateSession(undefined);
    assert.equal(hasSession(oldest), false);
    assert.equal(hasSession(neu.id), true);
    assert.equal(sessionIdsOldestFirstForTests().length, MAX_SESSIONS);
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

  it('required commit fails when missing', () => {
    const { state } = getOrCreateSession(undefined);
    assert.throws(() => assertSeedReveal(state, 'x', { required: true }), /commit required/);
  });

  it('seedCommitRequired defaults https on / env override', () => {
    assert.equal(seedCommitRequired('https://satstogether.greerso.com', {}), true);
    assert.equal(seedCommitRequired('http://localhost:3000', {}), false);
    assert.equal(seedCommitRequired('http://localhost:3000', { REQUIRE_SEED_COMMIT: '1' }), true);
    assert.equal(seedCommitRequired('https://x.com', { REQUIRE_SEED_COMMIT: '0' }), false);
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
    assert.ok(s.positions[0]?.account.includes('<'));
  });
});
