// SatsTogether Quadratic Voting for Yield Sources (Bitcoin-signed, no central authority)
//
// NOT SYBIL-RESISTANT and NOT WEIGHT-INTEGRITY:
// - Multi-key: Math.sqrt(votes) only limits how much *one key* can dominate if
//   the client is honest. Splitting sats across N keys yields N votes.
// - Single-key: castVote signs asserted `weight`, not `votes`. tallyVotes never
//   recomputes sqrt(votes); a signer can put any finite weight in the message.
// Real QV needs identity/cost weighting + weight derivation on the consensus side.
// This file intentionally does not fake those guarantees.
import { defaultMockSigner, type Signer } from './crypto.ts';

export const VERSION = '0.1.0-prototype';

export interface Vote {
  source: string;
  weight: number;
  signature: string;
  pubkey: string;
}

export interface TallyResult {
  winner: string | null;
  tally: Record<string, number>;
}

// Signs with a private key the caller holds; the pubkey travels with the
// vote so anyone can later verify it via verifyMessage without needing
// the private key. Optional Signer defaults to MockSigner.
export async function castVote(
  source: string,
  votes: number,
  privKey: string,
  pubkey: string,
  signer: Signer = defaultMockSigner,
): Promise<Vote> {
  if (!(votes >= 0) || !Number.isFinite(votes)) {
    throw new Error('votes must be a non-negative finite number');
  }
  const weight = Math.sqrt(votes); // Quadratic weight (float; production needs fixed-point)
  const signature = await signer.signMessage(`Vote:${source}:${weight}`, privKey);
  return { source, weight, signature, pubkey };
}

export function tallyVotes(
  votes: Vote[],
  signer: Signer = defaultMockSigner,
): TallyResult {
  if (votes.length === 0) {
    return { winner: null, tally: {} as Record<string, number> };
  }

  const seenPubkeys = new Set<string>();
  const tally: Record<string, number> = {};

  for (const v of votes) {
    if (seenPubkeys.has(v.pubkey)) continue; // one valid vote per pubkey
    if (!signer.verifyMessage(`Vote:${v.source}:${v.weight}`, v.signature, v.pubkey)) continue;
    seenPubkeys.add(v.pubkey); // only after valid verify — first *valid* wins
    tally[v.source] = (tally[v.source] || 0) + v.weight; // weight is caller-asserted
  }

  const sources = Object.keys(tally);
  const winner = sources.length > 0
    ? sources.reduce((a, b) => tally[a] > tally[b] ? a : b)
    : null;

  return { winner, tally };
}
