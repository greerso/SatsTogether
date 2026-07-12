/**
 * Phase 0 unit tests — governance mock crypto + quadratic tally.
 * Run: npm test (from repo root)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signMessage, verifyMessage, VERSION as CRYPTO_VERSION } from '../governance/crypto.ts';
import { castVote, tallyVotes, VERSION as VOTING_VERSION } from '../governance/voting.ts';

describe('governance crypto (mock)', () => {
  it('exports prototype version', () => {
    assert.match(CRYPTO_VERSION, /prototype/);
  });

  it('sign + verify round-trip when pubkey equals privKey (mock contract)', async () => {
    const key = 'test-key-alice';
    const msg = 'Vote:DLC:1.5';
    const sig = await signMessage(msg, key);
    assert.equal(verifyMessage(msg, sig, key), true);
  });

  it('rejects tampered message', async () => {
    const key = 'test-key-bob';
    const sig = await signMessage('Vote:A:1', key);
    assert.equal(verifyMessage('Vote:A:2', sig, key), false);
  });

  it('rejects wrong key', async () => {
    const sig = await signMessage('hello', 'alice');
    assert.equal(verifyMessage('hello', sig, 'bob'), false);
  });
});

describe('governance voting (prototype, not sybil-resistant)', () => {
  it('exports prototype version', () => {
    assert.match(VOTING_VERSION, /prototype/);
  });

  it('empty tally returns null winner', () => {
    const r = tallyVotes([]);
    assert.equal(r.winner, null);
    assert.deepEqual(r.tally, {});
  });

  it('quadratic weight is sqrt of votes', async () => {
    const vote = await castVote('DLC', 9, 'k1', 'k1');
    assert.equal(vote.weight, 3);
    assert.equal(vote.source, 'DLC');
  });

  it('tallies valid votes and picks highest weight source', async () => {
    const v1 = await castVote('DLC', 9, 'alice', 'alice'); // weight 3
    const v2 = await castVote('Ark', 4, 'bob', 'bob'); // weight 2
    const r = tallyVotes([v1, v2]);
    assert.equal(r.winner, 'DLC');
    assert.equal(r.tally['DLC'], 3);
    assert.equal(r.tally['Ark'], 2);
  });

  it('dedupes by pubkey (one vote per key)', async () => {
    const a1 = await castVote('DLC', 9, 'alice', 'alice');
    const a2 = await castVote('Ark', 100, 'alice', 'alice'); // same pubkey, ignored
    const r = tallyVotes([a1, a2]);
    assert.equal(r.winner, 'DLC');
    assert.equal(Object.keys(r.tally).length, 1);
  });

  it('skips invalid signatures', async () => {
    const good = await castVote('DLC', 4, 'alice', 'alice');
    const bad = {
      source: 'Ark',
      weight: 99,
      signature: 'mock-sig:deadbeef',
      pubkey: 'mallory',
    };
    const r = tallyVotes([good, bad]);
    assert.equal(r.winner, 'DLC');
    assert.equal(r.tally['Ark'], undefined);
  });
});
