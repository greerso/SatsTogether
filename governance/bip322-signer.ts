// SatsTogether BIP-322 signer placeholder (Phase 3 prep).
//
// NOT IMPLEMENTED. Does not perform BIP-322 or any real Bitcoin signing.
// Exists so production wiring points are visible and tests document the gap.

import type { Signer } from './signer.ts';

export const VERSION = '0.1.0-prototype';

/**
 * Stub for a future BIP-322 (or equivalent) Signer.
 * All methods fail closed — never pretends to verify.
 */
export class Bip322Signer implements Signer {
  async signMessage(_message: string, _privKey: string): Promise<string> {
    throw new Error(
      'Bip322Signer: BIP-322 message signing is not implemented (Phase 3+). Use MockSigner for prototype tests only.',
    );
  }

  verifyMessage(_message: string, _signature: string, _pubKey: string): boolean {
    // Fail closed — never return true until real BIP-322 lands.
    return false;
  }
}
