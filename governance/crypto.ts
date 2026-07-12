// SatsTogether Governance Signing — MOCK ONLY
//
// Implements Signer with deterministic hash "signatures". NOT BIP-322,
// NOT elliptic-curve crypto. Replace with a real Signer before any use.

import type { Signer } from './signer.ts';

export const VERSION = '0.1.0-prototype';
export type { Signer } from './signer.ts';

/**
 * MockSigner — prototype only.
 *
 * Signature = hash(message + ':' + keyMaterial). Verification recomputes the
 * same hash using the claimed pubkey in place of the private key, so it only
 * "verifies" when pubkey === privKey string (mock keypair convention).
 */
export class MockSigner implements Signer {
  async signMessage(message: string, privKey: string): Promise<string> {
    return `mock-sig:${simpleHash(message + ':' + privKey)}`;
  }

  verifyMessage(message: string, signature: string, pubKey: string): boolean {
    return signature === `mock-sig:${simpleHash(message + ':' + pubKey)}`;
  }
}

/** Default mock instance for convenience wrappers and existing call sites. */
export const defaultMockSigner: Signer = new MockSigner();

/** @deprecated Prefer injecting Signer; kept for Phase 0 call-site compat. */
export async function signMessage(message: string, privKey: string): Promise<string> {
  return defaultMockSigner.signMessage(message, privKey);
}

/** @deprecated Prefer injecting Signer; kept for Phase 0 call-site compat. */
export function verifyMessage(message: string, signature: string, pubKey: string): boolean {
  return defaultMockSigner.verifyMessage(message, signature, pubKey);
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
