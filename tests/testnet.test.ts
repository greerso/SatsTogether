/**
 * Phase 2 unit tests — block-hash parsing + mocked explorer fetch.
 * Live network is optional: RUN_LIVE_TESTNET=1 npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hexToBytes32,
  bytes32ToHex,
  parseUserSeed,
  fetchAdjacentBlockHashes,
  NetworkError,
  NETWORK_BASE_URL,
  VERSION,
} from '../testnet/block-hash.ts';
import { runTestnetDraw, TESTNET_BANNER } from '../testnet/draw-from-chain.ts';

describe('testnet/block-hash', () => {
  it('exports prototype version and testnet/signet bases only', () => {
    assert.match(VERSION, /prototype/);
    assert.ok(NETWORK_BASE_URL.testnet.includes('testnet'));
    assert.ok(NETWORK_BASE_URL.signet.includes('signet'));
    assert.equal('mainnet' in NETWORK_BASE_URL, false);
  });

  it('hexToBytes32 round-trip', () => {
    const hex = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
    const b = hexToBytes32(hex);
    assert.equal(b.length, 32);
    assert.equal(bytes32ToHex(b), hex);
    assert.deepEqual(hexToBytes32('0x' + hex), b);
  });

  it('rejects bad hex length', () => {
    assert.throws(() => hexToBytes32('dead'), /64 hex/);
  });

  it('parseUserSeed accepts hex64 or folds string', () => {
    const hex = '11'.repeat(32);
    assert.equal(bytes32ToHex(parseUserSeed(hex)), hex);
    const a = parseUserSeed('demo');
    const b = parseUserSeed('demo');
    assert.deepEqual([...a], [...b]);
    assert.notDeepEqual([...a], [...parseUserSeed('other')]);
  });

  it('fetchAdjacentBlockHashes uses tip-1 and tip (mocked)', async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string) => {
      calls.push(url);
      if (url.endsWith('/blocks/tip/height')) {
        return { ok: true, status: 200, text: async () => '100' };
      }
      if (url.endsWith('/block-height/99')) {
        return {
          ok: true,
          status: 200,
          text: async () => 'aa'.repeat(32),
        };
      }
      if (url.endsWith('/block-height/100')) {
        return {
          ok: true,
          status: 200,
          text: async () => 'bb'.repeat(32),
        };
      }
      return { ok: false, status: 404, text: async () => 'no' };
    };

    const r = await fetchAdjacentBlockHashes({
      network: 'testnet',
      fetchImpl,
      timeoutMs: 5000,
    });
    assert.equal(r.heightN, 99);
    assert.equal(r.heightN1, 100);
    assert.equal(r.hashNHex, 'aa'.repeat(32));
    assert.equal(r.hashN1Hex, 'bb'.repeat(32));
    assert.equal(r.blockHashN[0], 0xaa);
    assert.equal(r.blockHashN1[0], 0xbb);
    assert.ok(calls.some(c => c.includes('/blocks/tip/height')));
  });

  it('propagates NetworkError on HTTP failure', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503, text: async () => 'down' });
    await assert.rejects(
      () => fetchAdjacentBlockHashes({ fetchImpl, timeoutMs: 1000 }),
      (e: unknown) => e instanceof NetworkError,
    );
  });
});

describe('testnet/draw-from-chain', () => {
  it('banner is testnet-only and forbids mainnet claim', () => {
    assert.match(TESTNET_BANNER, /TESTNET/);
    assert.match(TESTNET_BANNER, /NOT mainnet/i);
    assert.doesNotMatch(TESTNET_BANNER, /mainnet default/i);
  });

  it('runTestnetDraw returns winners from mocked chain', async () => {
    const fetchImpl = async (url: string) => {
      if (url.endsWith('/blocks/tip/height')) {
        return { ok: true, status: 200, text: async () => '50' };
      }
      if (url.endsWith('/block-height/49')) {
        return { ok: true, status: 200, text: async () => '11'.repeat(32) };
      }
      if (url.endsWith('/block-height/50')) {
        return { ok: true, status: 200, text: async () => '22'.repeat(32) };
      }
      return { ok: false, status: 404, text: async () => '' };
    };

    const r = await runTestnetDraw({
      network: 'testnet',
      totalShares: 100n,
      numWinners: 3,
      userSeed: 'demo',
      fetchImpl,
    });
    assert.equal(r.network, 'testnet');
    assert.equal(r.winners.length, 3);
    assert.ok(r.banner.includes('TESTNET'));
    // deterministic for fixed hashes+seed
    const r2 = await runTestnetDraw({
      network: 'testnet',
      totalShares: 100n,
      numWinners: 3,
      userSeed: 'demo',
      fetchImpl,
    });
    assert.deepEqual(r.winners, r2.winners);
  });
it('retries alternate explorer base when primary fails', async () => {
    let calls = 0;
    const fetchImpl = async (url: string) => {
      calls++;
      if (url.includes('mempool.space')) {
        return { ok: false, status: 503, text: async () => 'down' };
      }
      if (url.endsWith('/blocks/tip/height')) {
        return { ok: true, status: 200, text: async () => '10' };
      }
      if (url.endsWith('/block-height/9')) {
        return { ok: true, status: 200, text: async () => 'aa'.repeat(32) };
      }
      if (url.endsWith('/block-height/10')) {
        return { ok: true, status: 200, text: async () => 'bb'.repeat(32) };
      }
      return { ok: false, status: 404, text: async () => '' };
    };
    const r = await fetchAdjacentBlockHashes({ network: 'testnet', fetchImpl });
    assert.ok(r.baseUrl.includes('blockstream.info'));
    assert.equal(r.heightN1, 10);
    assert.ok(calls > 1);
  });
});

describe('live testnet (optional)', () => {
  it('fetches real testnet tip when RUN_LIVE_TESTNET=1', async (t) => {
    if (process.env.RUN_LIVE_TESTNET !== '1') {
      t.skip('set RUN_LIVE_TESTNET=1 to exercise live explorer');
      return;
    }
    const r = await runTestnetDraw({
      network: 'testnet',
      totalShares: 1000n,
      numWinners: 3,
      userSeed: 'live-smoke',
      timeoutMs: 20_000,
    });
    assert.ok(r.heights.n1 > 0);
    assert.equal(r.hashes.n.length, 64);
    assert.equal(r.winners.length, 3);
  });
});
