#!/usr/bin/env node
/**
 * Phase 2 CLI — fetch real testnet/signet block hashes and run offline draw.
 *
 * Usage:
 *   npm run testnet:draw
 *   npm run testnet:draw -- --network signet --shares 1000 --winners 5 --seed demo-seed
 *
 * Soft-exits 0 with a clear message if the network is unreachable (code path real).
 * Exit 2 on usage/validation errors. Never defaults to mainnet.
 */

import { NetworkError } from '../testnet/block-hash.ts';
import { runTestnetDraw, TESTNET_BANNER } from '../testnet/draw-from-chain.ts';
import type { ChainNetwork } from '../testnet/block-hash.ts';

function usage(): never {
  console.error(`Usage: npm run testnet:draw -- [options]

Options:
  --network testnet|signet   Chain network (default: testnet). Mainnet refused.
  --shares <n>               Total share space (default: 1000)
  --winners <n>              Number of winners requested (default: 5)
  --seed <hex|string>        User seed hex64 or demo string (default: satstogether-testnet-demo)
  --timeout-ms <n>           HTTP timeout (default: 15000)
  --help                     Show this help

TESTNET/SIGNET ONLY. Not mainnet. Not audited. Offline draw model only.
`);
  process.exit(2);
}

function parseArgs(argv: string[]) {
  let network: ChainNetwork = 'testnet';
  let shares = 1000n;
  let winners = 5;
  let seed = 'satstogether-testnet-demo';
  let timeoutMs = 15_000;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--help' || a === '-h') usage();
    if (a === '--network') {
      const v = argv[++i];
      if (v !== 'testnet' && v !== 'signet') {
        console.error('ERROR: --network must be testnet or signet (mainnet refused)');
        process.exit(2);
      }
      network = v;
      continue;
    }
    if (a === '--shares') {
      const v = argv[++i];
      if (!v || !/^\d+$/.test(v) || BigInt(v) <= 0n) {
        console.error('ERROR: --shares must be a positive integer');
        process.exit(2);
      }
      shares = BigInt(v);
      continue;
    }
    if (a === '--winners') {
      const v = argv[++i];
      const n = Number(v);
      if (!v || !Number.isInteger(n) || n < 0) {
        console.error('ERROR: --winners must be a non-negative integer');
        process.exit(2);
      }
      winners = n;
      continue;
    }
    if (a === '--seed') {
      seed = argv[++i] ?? '';
      if (!seed) {
        console.error('ERROR: --seed requires a value');
        process.exit(2);
      }
      continue;
    }
    if (a === '--timeout-ms') {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 1000) {
        console.error('ERROR: --timeout-ms must be >= 1000');
        process.exit(2);
      }
      timeoutMs = n;
      continue;
    }
    console.error(`Unknown arg: ${a}`);
    usage();
  }

  return { network, shares, winners, seed, timeoutMs };
}

async function main() {
  console.log(TESTNET_BANNER);
  console.log('');

  const args = parseArgs(process.argv.slice(2));
  console.log(`Network: ${args.network}`);
  console.log(`Shares:  ${args.shares}   Winners: ${args.winners}`);
  console.log(`Seed:    ${args.seed}`);
  console.log('');

  try {
    const result = await runTestnetDraw({
      network: args.network,
      totalShares: args.shares,
      numWinners: args.winners,
      userSeed: args.seed,
      timeoutMs: args.timeoutMs,
    });

    console.log(`Tip pair heights: ${result.heights.n} + ${result.heights.n1}`);
    console.log(`block_hash_n  (${result.heights.n}):  ${result.hashes.n}`);
    console.log(`block_hash_n1 (${result.heights.n1}): ${result.hashes.n1}`);
    console.log('');
    console.log(`Winners (indices): ${result.winners.join(', ') || '(none)'}`);
    console.log('');
    console.log(result.note);
    process.exit(0);
  } catch (e) {
    if (e instanceof NetworkError) {
      console.error('');
      console.error('SOFT FAIL (network): could not reach testnet explorer.');
      console.error(`  ${e.message}`);
      console.error('Code path is real; retry when online. Exit 0 by design for soft-fail CI.');
      process.exit(0);
    }
    console.error('ERROR:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
