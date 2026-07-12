/**
 * Phase 0 unit tests — mock BitVM verifier + yield rotator.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BitVMVerifier, VERSION as VERIFIER_VERSION } from '../bitvm/verifier.ts';
import { YieldRotatorV0_6, VERSION as ROTATOR_VERSION } from '../yield-adapters/rotator-v0.6.ts';

describe('BitVMVerifier (mock)', () => {
  it('exports prototype version', () => {
    assert.match(VERIFIER_VERSION, /prototype/);
  });

  it('generateProof is deterministic for a source', async () => {
    const v = new BitVMVerifier();
    const a = await v.generateProof('DLC');
    const b = await v.generateProof('DLC');
    assert.equal(a.yieldSats, b.yieldSats);
    assert.equal(a.onChainProof, b.onChainProof);
    assert.equal(a.valid, true);
    assert.ok(a.onChainProof?.startsWith('mock-proof:'));
  });

  it('proof strings include the source name', async () => {
    const v = new BitVMVerifier();
    const a = await v.generateProof('DLC');
    const b = await v.generateProof('Ark');
    assert.ok(a.onChainProof?.includes('DLC'));
    assert.ok(b.onChainProof?.includes('Ark'));
  });

  it('isValidYieldProof rejects null proof or zero yield', () => {
    const v = new BitVMVerifier();
    assert.equal(
      v.isValidYieldProof({ source: 'x', yieldSats: 0, onChainProof: 'p', valid: true }),
      false
    );
    assert.equal(
      v.isValidYieldProof({ source: 'x', yieldSats: 10, onChainProof: null, valid: true }),
      false
    );
    assert.equal(
      v.isValidYieldProof({ source: 'x', yieldSats: 10, onChainProof: 'p', valid: false }),
      false
    );
  });
});

describe('YieldRotatorV0_6 (prototype)', () => {
  it('exports prototype version', () => {
    assert.match(ROTATOR_VERSION, /prototype/);
  });

  it('rotateAndRoute returns a valid source with positive yield under mock verifier', async () => {
    const rot = new YieldRotatorV0_6();
    const result = await rot.rotateAndRoute({});
    assert.ok(result.yieldAmount > 0);
    assert.ok(['DLC', 'Ark', 'BitVMWrapper', 'buffer'].includes(result.source));
    if (result.source !== 'buffer') {
      assert.ok(result.proof?.startsWith('mock-proof:'));
    }
  });

  it('getYieldHealth reports three sources with boolean validity', async () => {
    const rot = new YieldRotatorV0_6();
    const health = await rot.getYieldHealth();
    assert.equal(typeof health.overallHealthy, 'boolean');
    assert.equal(health.sources.length, 3);
    assert.equal(typeof health.timestamp, 'number');
    for (const s of health.sources) {
      assert.ok(['DLC', 'Ark', 'BitVMWrapper'].includes(s.source));
      assert.equal(typeof s.valid, 'boolean');
    }
  });

  it('liquidity buffer is drawn down to zero when all sources invalid', async () => {
    const rot = new YieldRotatorV0_6();
    // Force buffer path: private checkAllSources is only reachable via cast in tests.
    const anyRot = rot as unknown as {
      checkAllSources: () => Promise<
        Array<{ source: string; valid: boolean; yieldAmount: number; proof: string | null }>
      >;
      rotateAndRoute: (s: {
        liquidityBuffer?: number;
      }) => Promise<{ yieldAmount: number; source: string }>;
    };
    anyRot.checkAllSources = async () => [];
    const state = { liquidityBuffer: 500 };
    const result = await anyRot.rotateAndRoute(state);
    assert.equal(result.source, 'buffer');
    assert.equal(result.yieldAmount, 500);
    assert.equal(state.liquidityBuffer, 0);
    const result2 = await anyRot.rotateAndRoute(state);
    assert.equal(result2.yieldAmount, 0);
  });
});
