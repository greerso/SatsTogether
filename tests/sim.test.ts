/**
 * Phase 1 — off-chain draw model property tests + interface labeling.
 * Run: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  selectWinners,
  sampleHashes,
  placeholderMix,
  VERSION as DRAW_VERSION,
} from '../sim/draw.ts';
import { ShareLedger, DEFAULT_SATS_PER_SHARE, VERSION as LEDGER_VERSION } from '../sim/ledger.ts';
import { MockSigner, defaultMockSigner } from '../governance/crypto.ts';
import type { Signer } from '../governance/signer.ts';
import { MockBitVMVerifier, BitVMVerifier } from '../bitvm/verifier.ts';
import type { YieldProofVerifier } from '../bitvm/yield-proof.ts';

describe('sim/draw selectWinners properties', () => {
  it('exports prototype version', () => {
    assert.match(DRAW_VERSION, /prototype/);
  });

  it('zero total shares returns empty (no panic)', () => {
    const [a, b, c] = sampleHashes();
    const winners = selectWinners(a, b, c, 0n, 5);
    assert.deepEqual(winners, []);
  });

  it('num winners > total shares caps at total shares', () => {
    const [a, b, c] = sampleHashes();
    const winners = selectWinners(a, b, c, 5n, 50);
    assert.equal(winners.length, 5);
  });

  it('rejects duplicates (all winner indices unique)', () => {
    const [a, b, c] = sampleHashes();
    const winners = selectWinners(a, b, c, 1000n, 20);
    const seen = new Set(winners.map(String));
    assert.equal(seen.size, winners.length);
  });

  it('all indices strictly within [0, totalShares)', () => {
    const [a, b, c] = sampleHashes();
    const total = 777n;
    const winners = selectWinners(a, b, c, total, 30);
    for (const w of winners) {
      assert.ok(w >= 0n && w < total, `out of bounds: ${w}`);
    }
  });

  it('deterministic: same seeds → same winners', () => {
    const [a, b, c] = sampleHashes();
    const w1 = selectWinners(a, b, c, 500n, 10);
    const w2 = selectWinners(a, b, c, 500n, 10);
    assert.deepEqual(w1, w2);
  });

  it('different user seed usually changes outcome (smoke non-collision)', () => {
    const [a, b, c] = sampleHashes();
    const c2 = new Uint8Array(c);
    c2[0] = (c2[0]! + 1) & 0xff;
    const w1 = selectWinners(a, b, c, 500n, 10);
    const w2 = selectWinners(a, b, c2, 500n, 10);
    // Soft property: changed seed should not yield identical full winner lists.
    // (Collision is theoretically possible with placeholder_mix; fail loudly if so.)
    assert.notDeepEqual(w1, w2);
  });

  it('placeholderMix is deterministic', () => {
    const input = new Uint8Array(32);
    input[0] = 42;
    const x = placeholderMix(input, 3);
    const y = placeholderMix(input, 3);
    assert.deepEqual([...x], [...y]);
  });

  it('numWinners 0 returns empty', () => {
    const [a, b, c] = sampleHashes();
    assert.deepEqual(selectWinners(a, b, c, 100n, 0), []);
  });

  it('rejects non-32-byte seeds', () => {
    const [a, b, c] = sampleHashes();
    assert.throws(() => selectWinners(a.subarray(0, 16), b, c, 10n, 1), /32-byte/);
  });

  it('rejects non-integer numWinners', () => {
    const [a, b, c] = sampleHashes();
    assert.throws(() => selectWinners(a, b, c, 10n, 1.5), /integer/);
  });

  it('golden vectors lock Rust↔TS alignment', () => {
    const [a, b, c] = sampleHashes();
    assert.deepEqual(
      selectWinners(a, b, c, 5n, 50).map(Number),
      [1, 2, 4, 0, 3],
    );
    assert.deepEqual(
      selectWinners(a, b, c, 1000n, 20).map(Number),
      [
        846, 252, 394, 800, 695, 101, 243, 649, 534, 940, 82, 488, 487, 157, 563, 705, 854, 996,
        402, 544,
      ],
    );
    assert.deepEqual(
      [...placeholderMix(a, 0)],
      [
        0, 125, 243, 214, 139, 227, 91, 180, 235, 177, 105, 161, 17, 196, 107, 72, 151, 225, 215,
        64, 34, 2, 188, 89, 150, 249, 147, 185, 212, 19, 11, 3,
      ],
    );
  });
});

describe('sim/ledger share accounting', () => {
  it('exports prototype version and default share size', () => {
    assert.match(LEDGER_VERSION, /prototype/);
    assert.equal(DEFAULT_SATS_PER_SHARE, 1000n);
  });

  it('deposit mints shares; principal withdrawable independent of draw', () => {
    const ledger = new ShareLedger();
    const pos = ledger.deposit('alice', 5000n);
    assert.equal(pos.shareCount, 5n);
    assert.equal(ledger.totalShares, 5n);
    assert.equal(ledger.totalPrincipalSats, 5000n);

    ledger.accrueYield(1000n);
    const [a, b, c] = sampleHashes();
    ledger.draw(a, b, c, 2);

    const out = ledger.withdraw('alice');
    assert.equal(out.principalSats, 5000n);
    assert.equal(ledger.totalShares, 0n);
    assert.equal(ledger.totalPrincipalSats, 0n);
  });

  it('draw never allocates more than yield pool', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 10_000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 3);
    assert.ok(rec.allocated <= 100n);
    assert.equal(ledger.yieldPool + rec.allocated, 100n);
  });

  it('draw with no deposits leaves yield untouched', () => {
    const ledger = new ShareLedger();
    ledger.accrueYield(77n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 5);
    assert.deepEqual(rec.winners, []);
    assert.equal(rec.allocated, 0n);
    assert.equal(ledger.yieldPool, 77n);
  });

  it('all burned shares: no allocation, yield retained', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.withdraw('alice');
    ledger.accrueYield(50n);
    const [a, b, c] = sampleHashes();
    // High-water space is 1; any selected index is burned.
    const rec = ledger.draw(a, b, c, 1);
    assert.equal(rec.winners.length, 0);
    assert.equal(rec.allocated, 0n);
    assert.equal(ledger.yieldPool, 50n);
  });

  it('partial burn: only live winners share full pool', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n); // index 0
    ledger.deposit('bob', 1000n); // index 1
    ledger.withdraw('alice');
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    // space=2; sample golden for space 5 includes 1 — force numWinners high enough
    // that both 0 and 1 can appear; live filter keeps only bob (index 1).
    const rec = ledger.draw(a, b, c, 2);
    for (const w of rec.winners) {
      assert.equal(ledger.ownerOf(w), 'bob');
    }
    if (rec.winners.length > 0) {
      assert.equal(rec.prizePerWinner * BigInt(rec.winners.length), rec.allocated);
      assert.equal(ledger.yieldPool + rec.allocated, 100n);
      // Entire pool split among live winners only (burned get nothing).
      assert.equal(rec.prizePerWinner, 100n / BigInt(rec.winners.length));
    } else {
      assert.equal(ledger.yieldPool, 100n);
    }
  });

  it('withdraw burns shares so they no longer win', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n); // index 0
    ledger.deposit('bob', 1000n); // index 1
    ledger.withdraw('alice');
    assert.equal(ledger.ownerOf(0n), null);
    assert.equal(ledger.ownerOf(1n), 'bob');
    assert.equal(ledger.totalShares, 1n);
  });

  it('rejects non-multiple deposits', () => {
    const ledger = new ShareLedger();
    assert.throws(() => ledger.deposit('alice', 1500n), /multiple/);
  });

  it('top-up appends shares for same account (multi-segment)', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.deposit('bob', 1000n);
    const top = ledger.deposit('alice', 2000n);
    assert.equal(top.shareCount, 3n);
    assert.equal(top.principalSats, 3000n);
    assert.equal(top.segments.length, 2);
    assert.equal(top.segments[0]!.startIndex, 0n);
    assert.equal(top.segments[1]!.startIndex, 2n);
    assert.equal(ledger.ownerOf(0n), 'alice');
    assert.equal(ledger.ownerOf(1n), 'bob');
    assert.equal(ledger.ownerOf(2n), 'alice');
    assert.equal(ledger.ownerOf(3n), 'alice');
    assert.equal(ledger.totalShares, 4n);
    const out = ledger.withdraw('alice');
    assert.equal(out.principalSats, 3000n);
    assert.equal(ledger.ownerOf(0n), null);
    assert.equal(ledger.ownerOf(2n), null);
    assert.equal(ledger.ownerOf(1n), 'bob');
  });

  it('byAccount aggregates prizePerWinner per owner', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.deposit('bob', 1000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 2);
    let sum = 0n;
    for (const v of Object.values(rec.byAccount)) sum += v;
    assert.equal(sum, rec.allocated);
    for (const [acct, amt] of Object.entries(rec.byAccount)) {
      assert.ok(amt > 0n);
      assert.ok(acct === 'alice' || acct === 'bob');
    }
  });

  it('byAccount accumulates when one account wins multiple indices', () => {
    // Single owner holds both shares → both winning indices credit the same
    // account. Exercises the += accumulation (a `=` would only keep the last).
    const ledger = new ShareLedger();
    ledger.deposit('alice', 2000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 2);
    assert.equal(rec.winners.length, 2);
    assert.equal(Object.keys(rec.byAccount).length, 1);
    assert.equal(rec.byAccount.alice, rec.prizePerWinner * 2n);
    assert.equal(rec.byAccount.alice, rec.allocated);
  });

  it('claim credits from draw and claim drains balance', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 1);
    if (rec.winners.length) {
      assert.equal(ledger.claimBalance('alice'), rec.byAccount.alice ?? 0n);
      const out = ledger.claim('alice');
      assert.equal(out.claimedSats, rec.byAccount.alice);
      assert.equal(ledger.claimBalance('alice'), 0n);
      assert.throws(() => ledger.claim('alice'), /no claim/);
    } else {
      assert.equal(ledger.claimBalance('alice'), 0n);
    }
  });

  it('restore preserves ownership and claims', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.deposit('bob', 1000n);
    ledger.accrueYield(50n);
    const [a, b, c] = sampleHashes();
    ledger.draw(a, b, c, 2);
    const snap = ledger.snapshot();
    const restored = ShareLedger.restore(snap);
    assert.equal(restored.ownerOf(0n), 'alice');
    assert.equal(restored.ownerOf(1n), 'bob');
    assert.equal(restored.claimBalance('alice'), ledger.claimBalance('alice'));
    assert.equal(restored.claimBalance('bob'), ledger.claimBalance('bob'));
  });

  it('winnerDetails stay frozen after withdraw', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 1000n);
    ledger.deposit('bob', 1000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    ledger.draw(a, b, c, 2);
    ledger.withdraw('alice');
    const frozen = ledger.snapshot().draws[0]!.winnerDetails;
    assert.ok(frozen.some(w => w.account === 'alice' || w.account === 'bob'));
    for (const w of frozen) {
      if (w.account === 'alice') assert.equal(ledger.ownerOf(w.index), null);
    }
  });
});

describe('Phase 1 interfaces: Mock* labeling', () => {
  it('MockSigner implements Signer', async () => {
    const signer: Signer = new MockSigner();
    const sig = await signer.signMessage('hi', 'k');
    assert.equal(signer.verifyMessage('hi', sig, 'k'), true);
    assert.equal(defaultMockSigner.verifyMessage('hi', sig, 'k'), true);
  });

  it('MockBitVMVerifier implements YieldProofVerifier', async () => {
    const v: YieldProofVerifier = new MockBitVMVerifier();
    const proof = await v.generateProof('DLC');
    assert.equal(v.isValidYieldProof(proof), true);
    assert.ok(proof.onChainProof?.startsWith('mock-proof:'));
  });

  it('BitVMVerifier alias still works (deprecated)', async () => {
    const v = new BitVMVerifier();
    const p = await v.generateProof('Ark');
    assert.equal(p.valid, true);
  });
});
