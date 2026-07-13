/**
 * BIP-322 signer stub tests — must fail closed.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Bip322Signer, VERSION } from '../governance/bip322-signer.ts';
import type { Signer } from '../governance/signer.ts';

describe('Bip322Signer stub (Phase 3 prep)', () => {
  it('exports prototype version', () => {
    assert.match(VERSION, /prototype/);
  });

  it('implements Signer interface', () => {
    const s: Signer = new Bip322Signer();
    assert.equal(typeof s.signMessage, 'function');
    assert.equal(typeof s.verifyMessage, 'function');
  });

  it('signMessage throws (not implemented)', async () => {
    const s = new Bip322Signer();
    await assert.rejects(() => s.signMessage('hi', 'key'), /not implemented/);
  });

  it('verifyMessage always returns false', () => {
    const s = new Bip322Signer();
    assert.equal(s.verifyMessage('hi', 'sig', 'pub'), false);
  });
});
