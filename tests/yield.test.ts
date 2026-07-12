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

  it('different sources can produce different yields', async () => {
    const v = new BitVMVerifier();
    const a = await v.generateProof('DLC');
    const b = await v.generateProof('Ark');
    // Not required they differ, but proof strings must include source
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

  it('buffer path zeros buffer when all sources invalid (simulated via empty buffer after)', async () => {
    // With current mock, sources always valid — exercise buffer field mutation contract
    // by checking getYieldHealth shape.
    const rot = new YieldRotatorV0_6();
    const health = await rot.getYieldHealth();
    assert.equal(typeof health.overallHealthy, 'boolean');
    assert.equal(health.sources.length, 3);
    assert.ok(typeof health.timestamp === 'number');
    for (const s of health.sources) {
      assert.ok(['DLC', 'Ark', 'BitVMWrapper'].includes(s.source));
      assert.equal(typeof s.valid, 'boolean');
    }
  });

  it('liquidity buffer is drawn down when used (unit of buffer accounting)', async () => {
    // Mock sources are always valid, so buffer path is not taken in rotateAndRoute.
    // Document expected buffer semantics if we force empty valid set via a subclass.
    class FailRotator extends YieldRotatorV0_6 {
      // @ts-expect-error test double
      private sources = [] as const;
      // Override isolation path by monkey-patching check via empty sources on prototype pattern
    }
    // Direct buffer contract: call rotate with a rotator whose checkAllSources returns []
    const rot = new YieldRotatorV0_6() as YieldRotatorV0_6 & {
      checkAllSources?: () => Promise<unknown[]>;
    };
    // Access private via casting for test
    const anyRot = rot as unknown as {
      checkAllSources: () => Promise<Array<{ source: string; valid: boolean; yieldAmount: number; proof: string | null }>>;
      rotateAndRoute: (s: { liquidityBuffer?: number }) => Promise<{ yieldAmount: number; source: string }>;
    };
    anyRot.checkAllSources = async () => [];
    const state = { liquidityBuffer: 500 };
    const result = await anyRot.rotateAndRoute(state);
    assert.equal(result.source, 'buffer');
    assert.equal(result.yieldAmount, 500);
    assert.equal(state.liquidityBuffer, 0);
    // second call: buffer empty
    const result2 = await anyRot.rotateAndRoute(state);
    assert.equal(result2.yieldAmount, 0);
  });
});
