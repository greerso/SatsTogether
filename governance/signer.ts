// SatsTogether message signing interfaces (Phase 1).
//
// Production goal: BIP-322 (or equivalent) Bitcoin message signing.
// Current code only ships MockSigner — NOT real cryptography.

export const VERSION = '0.1.0-prototype';

/**
 * Pluggable message signer/verifier.
 *
 * Production impls (e.g. BIP-322) drop in here without changing tally logic.
 * MockSigner is for offline tests and the prototype UI only.
 */
export interface Signer {
  /** Create a signature over `message` with a private key material. */
  signMessage(message: string, privKey: string): Promise<string>;

  /**
   * Verify `signature` over `message` for `pubKey`.
   * MockSigner treats pubKey === privKey material; real impls use ECDSA/Schnorr.
   */
  verifyMessage(message: string, signature: string, pubKey: string): boolean;
}
