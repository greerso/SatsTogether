// SatsTogether Governance Signing
//
// PROTOTYPE MOCK — NOT real Bitcoin (BIP-322 / message) signing. Replace
// with a real signer before any use.

export const VERSION = '0.1.0-prototype';

// Deterministic mock signature: a hash of message+privKey, not a real
// Bitcoin signature. Anyone who knows the "private key" string can
// reproduce it; there is no actual elliptic-curve cryptography involved.
export async function signMessage(message: string, privKey: string): Promise<string> {
  return `mock-sig:${simpleHash(message + ':' + privKey)}`;
}

// Matching mock verifier: recomputes the same hash using the claimed
// pubkey in place of the privKey. This only "verifies" signatures produced
// by signMessage above with pubKey === privKey — it is not real signature
// verification against a Bitcoin public key.
export function verifyMessage(message: string, signature: string, pubKey: string): boolean {
  return signature === `mock-sig:${simpleHash(message + ':' + pubKey)}`;
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}
