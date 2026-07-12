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
    // Extremely unlikely to match fully with this mix; if it does, still OK as soft check
    const same = w1.length === w2.length && w1.every((v, i) => v === w2[i]);
    assert.equal(same, false);
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

  it('draw never pays more than yield pool', () => {
    const ledger = new ShareLedger();
    ledger.deposit('alice', 10_000n);
    ledger.accrueYield(100n);
    const [a, b, c] = sampleHashes();
    const rec = ledger.draw(a, b, c, 3);
    assert.ok(rec.paid <= 100n);
    assert.equal(ledger.yieldPool + rec.paid, 100n);
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
