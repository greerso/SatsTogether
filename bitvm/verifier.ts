// SatsTogether BitVM2 Yield Verifier — MOCK ONLY
//
// PROTOTYPE MOCK — returns simulated proofs, NOT real BitVM2 zero-knowledge
// yield proofs. A production version must verify on-chain BitVM2 proofs
// originating from the yield source, not manufacture them here.

import type { YieldProof, YieldProofVerifier } from './yield-proof.ts';

export const VERSION = '0.1.0-prototype';
export type { YieldProof, YieldProofVerifier } from './yield-proof.ts';

/**
 * MockBitVMVerifier — deterministic fake yields for offline tests/UI.
 * Explicitly labeled Mock* per Phase 1 exit criteria.
 */
export class MockBitVMVerifier implements YieldProofVerifier {
  // Deterministic mock: yield is derived from the source name, not randomness
  // or wall-clock time, so results are reproducible for testing.
  async generateProof(source: string): Promise<YieldProof> {
    const yieldSats = this.deterministicYield(source);
    return {
      source,
      yieldSats,
      onChainProof: `mock-proof:${source}:${yieldSats}`,
      valid: true,
    };
  }

  isValidYieldProof(proof: YieldProof): boolean {
    return proof.valid && proof.onChainProof !== null && proof.yieldSats > 0;
  }

  private deterministicYield(source: string): number {
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
    }
    return (hash % 1000) + 1;
  }
}

/**
 * @deprecated Use MockBitVMVerifier. Alias retained for one transition release.
 */
export class BitVMVerifier extends MockBitVMVerifier {}
