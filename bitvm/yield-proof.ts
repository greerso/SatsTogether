// SatsTogether yield-proof interfaces (Phase 1).
//
// Production goal: verify BitVM2 (or equivalent) on-chain proofs of yield.
// Current code only ships MockBitVMVerifier — manufactures mock proofs.

export const VERSION = '0.1.0-prototype';

export interface YieldProof {
  source: string;
  yieldSats: number;
  /** Serialized proof bytes/string; null if absent. */
  onChainProof: string | null;
  /** Whether the producer asserts validity (must still be checked by verifier). */
  valid: boolean;
}

/**
 * Verifies (and in mock mode, generates) yield proofs for a named source.
 *
 * Production: generateProof may not exist on-chain (prover is external);
 * isValidYieldProof is the security-critical path. Mock generates both.
 */
export interface YieldProofVerifier {
  /** Produce a proof for `source` (mock manufactures; real may fetch/relay). */
  generateProof(source: string): Promise<YieldProof>;

  /** Return true only if proof meets protocol validity rules. */
  isValidYieldProof(proof: YieldProof): boolean;
}
