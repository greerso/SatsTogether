// SatsTogether Quadratic Voting for Yield Sources (Bitcoin-signed, no central authority)
//
// NOT SYBIL-RESISTANT: client-side Math.sqrt(votes) weighting only limits
// how much *one key* can dominate. It does nothing to stop someone from
// splitting the same sats across N keys and casting N votes instead of
// one — N small votes beat one big vote under quadratic weighting. Real
// quadratic voting requires per-identity or paid-cost weighting enforced
// on the consensus/server side, which this prototype does not implement.
// This file intentionally does not fake that guarantee.
import { signMessage, verifyMessage } from './crypto';

export const VERSION = '0.1.0-prototype';

interface Vote {
  source: string;
  weight: number;
  signature: string;
  pubkey: string;
}

// Signs with a private key the caller holds; the pubkey travels with the
// vote so anyone can later verify it via verifyMessage without needing
// the private key.
export async function castVote(source: string, votes: number, privKey: string, pubkey: string): Promise<Vote> {
  const weight = Math.sqrt(votes); // Quadratic weight
  const signature = await signMessage(`Vote:${source}:${weight}`, privKey);
  return { source, weight, signature, pubkey };
}

export function tallyVotes(votes: Vote[]) {
  if (votes.length === 0) {
    return { winner: null, tally: {} as Record<string, number> };
  }

  const seenPubkeys = new Set<string>();
  const tally: Record<string, number> = {};

  for (const v of votes) {
    if (seenPubkeys.has(v.pubkey)) continue; // dedupe: one vote per pubkey
    if (!verifyMessage(`Vote:${v.source}:${v.weight}`, v.signature, v.pubkey)) continue; // skip invalid signatures
    seenPubkeys.add(v.pubkey);
    tally[v.source] = (tally[v.source] || 0) + v.weight;
  }

  const sources = Object.keys(tally);
  const winner = sources.length > 0
    ? sources.reduce((a, b) => tally[a] > tally[b] ? a : b)
    : null;

  return { winner, tally };
}