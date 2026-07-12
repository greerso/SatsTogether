/**
 * Phase 2: run off-chain draw selection using real testnet/signet block hashes.
 * TESTNET/SIGNET ONLY — banner required at CLI; no mainnet path.
 */

import { selectWinners } from '../sim/draw.ts';
import {
  fetchAdjacentBlockHashes,
  parseUserSeed,
  type ChainNetwork,
  type AdjacentBlockHashes,
} from './block-hash.ts';

export const VERSION = '0.1.0-prototype';

export const TESTNET_BANNER = [
  '╔══════════════════════════════════════════════════════════════╗',
  '║  SatsTogether — TESTNET / SIGNET ONLY                        ║',
  '║  Real block hashes → offline draw model (sim/draw).          ║',
  '║  NOT mainnet. NOT audited. NOT production randomness.        ║',
  '║  NOT BitVM2. NOT commit-reveal. Do not use real funds.       ║',
  '╚══════════════════════════════════════════════════════════════╝',
].join('\n');

export interface TestnetDrawInput {
  network?: ChainNetwork;
  totalShares: bigint;
  numWinners: number;
  /** Hex seed or demo string (folded non-cryptographically). */
  userSeed: string;
  baseUrl?: string;
  fetchImpl?: Parameters<typeof fetchAdjacentBlockHashes>[0]['fetchImpl'];
  timeoutMs?: number;
}

export interface TestnetDrawResult {
  banner: string;
  network: ChainNetwork;
  heights: { n: number; n1: number };
  hashes: { n: string; n1: string };
  totalShares: string;
  numWinners: number;
  winners: string[];
  note: string;
  chain: AdjacentBlockHashes;
}

export async function runTestnetDraw(input: TestnetDrawInput): Promise<TestnetDrawResult> {
  if (input.totalShares <= 0n) {
    throw new Error('totalShares must be > 0');
  }
  const chain = await fetchAdjacentBlockHashes({
    network: input.network ?? 'testnet',
    baseUrl: input.baseUrl,
    fetchImpl: input.fetchImpl,
    timeoutMs: input.timeoutMs,
  });
  const seed = parseUserSeed(input.userSeed);
  const winners = selectWinners(
    chain.blockHashN,
    chain.blockHashN1,
    seed,
    input.totalShares,
    input.numWinners,
  );

  return {
    banner: TESTNET_BANNER,
    network: chain.network,
    heights: { n: chain.heightN, n1: chain.heightN1 },
    hashes: { n: chain.hashNHex, n1: chain.hashN1Hex },
    totalShares: input.totalShares.toString(),
    numWinners: input.numWinners,
    winners: winners.map(String),
    note:
      'Offline selectWinners only. Hashes from public explorer REST. Soft-fail if network down at CLI.',
    chain,
  };
}
