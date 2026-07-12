// SatsTogether Yield Rotator v0.6
// Max-yield source selection + liquidity buffer + multi-source rotation
//
// PROTOTYPE — yield figures come from the mocked BitVMVerifier (see
// ../bitvm/verifier); no real yield is sourced, verified, or settled.

import { BitVMVerifier } from '../bitvm/verifier';

export const VERSION = '0.1.0-prototype';

const SOURCE_TIMEOUT_MS = 5000;

interface PoolState {
  liquidityBuffer?: number;
  [key: string]: unknown;
}

interface SourceCheckResult {
  source: string;
  valid: boolean;
  yieldAmount: number;
  proof: string | null;
}

// Runs a per-source check against its own timeout so one hung or throwing
// source can't take down the whole rotation — it just comes back invalid.
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>(resolve => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export class YieldRotatorV0_6 {
  private verifier = new BitVMVerifier();
  private sources = ['DLC', 'Ark', 'BitVMWrapper'] as const;

  async rotateAndRoute(poolState: PoolState) {
    const results = await this.checkAllSources();

    const valid = results.filter(r => r.valid);

    if (valid.length === 0) {
      // Fallback to buffer (funded by optional contributions). Drawing down
      // is stateful: the amount used is subtracted from the tracked buffer
      // so it can't be "spent" again on the next rotation.
      const available = poolState.liquidityBuffer || 0;
      poolState.liquidityBuffer = 0;
      return {
        yieldAmount: available,
        source: 'buffer',
        note: 'All sources low — using buffer. (Prototype: principal protection is a design goal, not yet enforced on-chain.)'
      };
    }

    // Picks whichever valid source reports the highest yield — a simple
    // max(), not any form of quadratic funding.
    const best = valid.reduce((a, b) => a.yieldAmount > b.yieldAmount ? a : b);

    return {
      yieldAmount: best.yieldAmount,
      source: best.source,
      proof: best.proof
    };
  }

  // Checks every configured source concurrently, each isolated from the others.
  private checkAllSources(): Promise<SourceCheckResult[]> {
    return Promise.all(this.sources.map(s => this.checkSourceIsolated(s)));
  }

  // Wraps checkSource with a timeout + catch so a hung or throwing source
  // resolves to an invalid result instead of rejecting the whole rotation.
  private async checkSourceIsolated(source: string): Promise<SourceCheckResult> {
    const failed: SourceCheckResult = { source, valid: false, yieldAmount: 0, proof: null };
    try {
      return await withTimeout(this.checkSource(source), SOURCE_TIMEOUT_MS, failed);
    } catch {
      return failed;
    }
  }

  private async checkSource(source: string): Promise<SourceCheckResult> {
    const proof = await this.verifier.generateProof(source);
    const valid = this.verifier.isValidYieldProof(proof);
    return {
      source,
      valid,
      yieldAmount: valid ? proof.yieldSats : 0,
      proof: valid ? proof.onChainProof : null
    };
  }

  // Public API for UI dashboard
  async getYieldHealth() {
    const results = await this.checkAllSources();
    return {
      overallHealthy: results.filter(r => r.valid).length >= 2,
      sources: results,
      timestamp: Date.now()
    };
  }
}