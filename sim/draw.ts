/**
 * SatsTogether off-chain draw model (Phase 1 simulator).
 *
 * TypeScript port of `bitvm/draw_verifier.rs::select_winners` so property
 * tests and the share ledger can run without FFI. MUST stay behavior-aligned
 * with the Rust reference (placeholder_mix, XOR seed, rejection sampling).
 *
 * NOT cryptographic. NOT BitVM2. NOT production randomness.
 */

export const VERSION = '0.1.0-prototype';

export type Bytes32 = Uint8Array; // length 32

/** NON-cryptographic placeholder — mirrors Rust `placeholder_mix`. */
export function placeholderMix(input: Bytes32, counter: number): Uint8Array {
  if (input.length !== 32) {
    throw new Error('placeholderMix expects 32-byte input');
  }
  const state = new Uint8Array(input);
  const counterBytes = u32ToLeBytes(counter >>> 0);
  for (let i = 0; i < 32; i++) {
    let byte = state[i];
    byte = (byte + counterBytes[i % 4]) & 0xff;
    byte = (byte * 31) & 0xff;
    const rot = (i % 7) + 1;
    byte = rotl8(byte, rot) ^ (i & 0xff);
    state[i] = byte & 0xff;
  }
  return state;
}

/**
 * Selects winning share indices.
 *
 * @returns up to `min(numWinners, totalShares)` distinct indices, each < totalShares.
 *          May be shorter than target if attempt budget is exhausted.
 *          Empty array if totalShares === 0.
 */
export function selectWinners(
  blockHashN: Bytes32,
  blockHashN1: Bytes32,
  userSeed: Bytes32,
  totalShares: bigint,
  numWinners: number,
): bigint[] {
  assertBytes32(blockHashN, 'blockHashN');
  assertBytes32(blockHashN1, 'blockHashN1');
  assertBytes32(userSeed, 'userSeed');
  if (totalShares < 0n) {
    throw new Error('totalShares must be >= 0');
  }
  const U64_MAX = 0xffff_ffff_ffff_ffffn;
  if (totalShares > U64_MAX) {
    throw new Error('totalShares must fit in u64');
  }
  if (!Number.isInteger(numWinners) || numWinners < 0 || numWinners > 0xffff_ffff) {
    throw new Error('numWinners must be an integer in [0, 2^32-1]');
  }
  if (totalShares === 0n) {
    return [];
  }

  const combined = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    combined[i] = blockHashN[i]! ^ blockHashN1[i]! ^ userSeed[i]!;
  }

  const target = minBigInt(BigInt(numWinners), totalShares);
  const winners: bigint[] = [];
  const seen = new Set<string>();

  // u64::MAX - (u64::MAX % total_shares) in Rust
  const limit = U64_MAX - (U64_MAX % totalShares);

  const maxAttempts = Math.max(10_000, Number(target) * 100);
  let counter = 0;
  let attempts = 0;

  while (BigInt(winners.length) < target && attempts < maxAttempts) {
    const mixed = placeholderMix(combined, counter);
    counter = (counter + 1) >>> 0;
    attempts += 1;

    const candidate = u64FromLeBytes(mixed.subarray(0, 8));
    if (candidate >= limit) {
      continue;
    }

    const index = candidate % totalShares;
    const key = index.toString();
    if (!seen.has(key)) {
      seen.add(key);
      winners.push(index);
    }
  }

  return winners;
}

/** Convenience: fixed sample hashes matching Rust unit tests. */
export function sampleHashes(): [Bytes32, Bytes32, Bytes32] {
  const a = new Uint8Array(32);
  const b = new Uint8Array(32);
  const c = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    a[i] = i;
    b[i] = (i * 3) & 0xff;
    c[i] = (i * 7 + 1) & 0xff;
  }
  return [a, b, c];
}

function assertBytes32(b: Bytes32, name: string): void {
  if (!(b instanceof Uint8Array) || b.length !== 32) {
    throw new Error(`${name} must be a 32-byte Uint8Array`);
  }
}

function u32ToLeBytes(n: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = n & 0xff;
  out[1] = (n >>> 8) & 0xff;
  out[2] = (n >>> 16) & 0xff;
  out[3] = (n >>> 24) & 0xff;
  return out;
}

function rotl8(byte: number, rot: number): number {
  const r = rot & 7;
  return ((byte << r) | (byte >>> (8 - r))) & 0xff;
}

function u64FromLeBytes(bytes: Uint8Array): bigint {
  let v = 0n;
  for (let i = 0; i < 8; i++) {
    v |= BigInt(bytes[i]!) << BigInt(8 * i);
  }
  return v;
}

function minBigInt(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}
