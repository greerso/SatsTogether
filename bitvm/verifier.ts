// SatsTogether BitVM2 Yield Verifier
//
// PROTOTYPE MOCK — returns simulated proofs, NOT real BitVM2 zero-knowledge
// yield proofs. A production version must verify on-chain BitVM2 proofs
// originating from the yield source, not manufacture them here.

export const VERSION = '0.1.0-prototype';

export interface YieldProof {
  source: string;
  yieldSats: number;
  onChainProof: string | null;
  valid: boolean;
}

export class BitVMVerifier {
  // Deterministic mock: yield is derived from the source name, not randomness
  // or wall-clock time, so results are reproducible for testing.
  async generateProof(source: string): Promise<YieldProof> {
    const yieldSats = this.deterministicYield(source);
    return {
      source,
      yieldSats,
      onChainProof: `mock-proof:${source}:${yieldSats}`,
      valid: true
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
