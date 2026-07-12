// SatsTogether Quadratic Voting for Yield Sources (Bitcoin-signed, no central authority)
//
// NOT SYBIL-RESISTANT: client-side Math.sqrt(votes) weighting only limits
// how much *one key* can dominate. It does nothing to stop someone from
// splitting the same sats across N keys and casting N votes instead of
// one — N small votes beat one big vote under quadratic weighting. Real
// quadratic voting requires per-identity or paid-cost weighting enforced
// on the consensus/server side, which this prototype does not implement.
// This file intentionally does not fake that guarantee.
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
  const weight = Math.sqrt(votes); // Quadratic weight
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
    if (seenPubkeys.has(v.pubkey)) continue; // dedupe: one vote per pubkey
    if (!signer.verifyMessage(`Vote:${v.source}:${v.weight}`, v.signature, v.pubkey)) continue;
    seenPubkeys.add(v.pubkey);
    tally[v.source] = (tally[v.source] || 0) + v.weight;
  }

  const sources = Object.keys(tally);
  const winner = sources.length > 0
    ? sources.reduce((a, b) => tally[a] > tally[b] ? a : b)
    : null;

  return { winner, tally };
}
