/**
 * Bitcoin testnet/signet block-hash sources (Phase 2 vertical slice).
 *
 * Fetches real chain tip hashes from a public REST explorer (default:
 * mempool.space testnet). Still OFF-CHAIN selection via sim/draw — not
 * BitVM2, not commit-reveal, not production randomness security.
 *
 * MAINNET IS NOT A DEFAULT and is not exported as a network preset.
 */

export const VERSION = '0.1.0-prototype';

/** Allowed networks for this slice. Mainnet intentionally omitted. */
export type ChainNetwork = 'testnet' | 'signet';

export const NETWORK_BASE_URL: Record<ChainNetwork, string> = {
  // mempool.space public REST (no API key). Soft-fail if unreachable.
  testnet: 'https://mempool.space/testnet/api',
  signet: 'https://mempool.space/signet/api',
};

export interface AdjacentBlockHashes {
  network: ChainNetwork;
  baseUrl: string;
  heightN: number;
  heightN1: number;
  hashNHex: string;
  hashN1Hex: string;
  blockHashN: Uint8Array;
  blockHashN1: Uint8Array;
}

export class NetworkError extends Error {
  cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/** Parse 64-char hex (optional 0x) into 32 bytes. Display order as returned by explorer. */
export function hexToBytes32(hex: string): Uint8Array {
  let h = hex.trim().toLowerCase();
  if (h.startsWith('0x')) h = h.slice(2);
  if (!/^[0-9a-f]{64}$/.test(h)) {
    throw new Error(`expected 64 hex chars for block hash, got length ${h.length}`);
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytes32ToHex(bytes: Uint8Array): string {
  if (bytes.length !== 32) throw new Error('expected 32 bytes');
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Parse user seed hex (must be 64 hex chars) or derive a deterministic demo seed from utf8. */
export function parseUserSeed(input: string): Uint8Array {
  const t = input.trim();
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(t)) {
    return hexToBytes32(t);
  }
  // Demo-only: fold utf8 into 32 bytes (NOT a cryptographic KDF).
  const out = new Uint8Array(32);
  for (let i = 0; i < t.length; i++) {
    out[i % 32] = (out[i % 32]! + t.charCodeAt(i) * (i + 1)) & 0xff;
  }
  out[0] ^= 0x5a;
  return out;
}

type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  text(): Promise<string>;
}>;

async function getText(fetchImpl: FetchLike, url: string, timeoutMs: number): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new NetworkError(`HTTP ${res.status} for ${url}`);
    }
    return (await res.text()).trim();
  } catch (e) {
    if (e instanceof NetworkError) throw e;
    throw new NetworkError(`fetch failed for ${url}: ${e instanceof Error ? e.message : String(e)}`, e);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch tip height and the two most recent block hashes (height tip-1 and tip).
 * `block_hash_n` = tip-1, `block_hash_n1` = tip (adjacent pair).
 */
export async function fetchAdjacentBlockHashes(opts: {
  network?: ChainNetwork;
  baseUrl?: string;
  /** Inject for tests; defaults to global fetch. */
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<AdjacentBlockHashes> {
  const network = opts.network ?? 'testnet';
  if (network !== 'testnet' && network !== 'signet') {
    throw new Error('only testnet|signet allowed (no mainnet default)');
  }
  const baseUrl = (opts.baseUrl ?? NETWORK_BASE_URL[network]).replace(/\/$/, '');
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as FetchLike);
  if (typeof fetchImpl !== 'function') {
    throw new NetworkError('global fetch is not available');
  }
  const timeoutMs = opts.timeoutMs ?? 15_000;

  const tipHeightStr = await getText(fetchImpl, `${baseUrl}/blocks/tip/height`, timeoutMs);
  const tipHeight = Number(tipHeightStr);
  if (!Number.isInteger(tipHeight) || tipHeight < 1) {
    throw new NetworkError(`invalid tip height: ${tipHeightStr}`);
  }

  const heightN1 = tipHeight;
  const heightN = tipHeight - 1;

  const hashNHex = await getText(fetchImpl, `${baseUrl}/block-height/${heightN}`, timeoutMs);
  const hashN1Hex = await getText(fetchImpl, `${baseUrl}/block-height/${heightN1}`, timeoutMs);

  return {
    network,
    baseUrl,
    heightN,
    heightN1,
    hashNHex,
    hashN1Hex,
    blockHashN: hexToBytes32(hashNHex),
    blockHashN1: hexToBytes32(hashN1Hex),
  };
}
