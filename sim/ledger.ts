/**
 * SatsTogether off-chain share ledger (Phase 1 simulator).
 *
 * Deterministic accounting for deposits → share indices, yield accrual,
 * prize claims, and principal withdraws. No chain, no custody, no real BTC.
 *
 * Share model (sim only):
 * - 1 share unit = SATS_PER_SHARE sats of principal (default 1000).
 * - Deposit mints contiguous share indices [nextIndex, nextIndex+n).
 * - Withdraw burns shares and returns principal; unclaimed prizes are forfeited
 *   in this sim (production policy TBD — see protocol-spec).
 */

import { selectWinners, type Bytes32 } from './draw.ts';

export const VERSION = '0.1.0-prototype';
export const DEFAULT_SATS_PER_SHARE = 1000n;

export type AccountId = string;

export interface Position {
  account: AccountId;
  /** Inclusive start index in global share space. */
  startIndex: bigint;
  /** Number of shares held (contiguous block). */
  shareCount: bigint;
  principalSats: bigint;
}

export interface DrawRecord {
  epoch: number;
  winners: bigint[];
  prizePerWinner: bigint;
  yieldAvailable: bigint;
  paid: bigint;
}

export interface LedgerSnapshot {
  totalShares: bigint;
  totalPrincipalSats: bigint;
  yieldPoolSats: bigint;
  nextShareIndex: bigint;
  positions: Position[];
  draws: DrawRecord[];
  epoch: number;
}

export class ShareLedger {
  readonly satsPerShare: bigint;
  private nextShareIndex = 0n;
  private positions = new Map<AccountId, Position>();
  private yieldPoolSats = 0n;
  private draws: DrawRecord[] = [];
  private epoch = 0;
  /** Map share index → account for O(1) winner lookup (sparse ok for sim). */
  private ownerByIndex = new Map<string, AccountId>();

  constructor(satsPerShare: bigint = DEFAULT_SATS_PER_SHARE) {
    if (satsPerShare <= 0n) {
      throw new Error('satsPerShare must be > 0');
    }
    this.satsPerShare = satsPerShare;
  }

  get totalShares(): bigint {
    let n = 0n;
    for (const p of this.positions.values()) {
      n += p.shareCount;
    }
    return n;
  }

  get totalPrincipalSats(): bigint {
    let n = 0n;
    for (const p of this.positions.values()) {
      n += p.principalSats;
    }
    return n;
  }

  get yieldPool(): bigint {
    return this.yieldPoolSats;
  }

  deposit(account: AccountId, principalSats: bigint): Position {
    if (!account) throw new Error('account required');
    if (principalSats <= 0n) throw new Error('principalSats must be > 0');
    if (principalSats % this.satsPerShare !== 0n) {
      throw new Error(`principalSats must be a multiple of satsPerShare (${this.satsPerShare})`);
    }

    const shareCount = principalSats / this.satsPerShare;
    const startIndex = this.nextShareIndex;

    // Sim v1: one contiguous open position per account.
    if (this.positions.has(account)) {
      throw new Error('sim v1: one open position per account (withdraw first)');
    }

    const pos: Position = {
      account,
      startIndex,
      shareCount,
      principalSats,
    };

    for (let i = 0n; i < shareCount; i++) {
      this.ownerByIndex.set((startIndex + i).toString(), account);
    }
    this.positions.set(account, pos);
    this.nextShareIndex += shareCount;
    return { ...pos };
  }

  /**
   * Accrue yield into the prize pool (mock: caller provides verified amount).
   * Does not mint shares. Principal unchanged.
   */
  accrueYield(amountSats: bigint): void {
    if (amountSats < 0n) throw new Error('amountSats must be >= 0');
    this.yieldPoolSats += amountSats;
  }

  /**
   * Run a draw over high-water share indices `[0, nextShareIndex)`.
   * Burned indices may be selected but are filtered out (no payout).
   * Prize is split evenly among live winners from the current yield pool;
   * remainder stays in the pool.
   */
  draw(
    blockHashN: Bytes32,
    blockHashN1: Bytes32,
    userSeed: Bytes32,
    numWinners: number,
  ): DrawRecord {
    // High-water index space keeps historical indices stable; burned holes pay nothing.
    const space = this.nextShareIndex;
    const raw = selectWinners(blockHashN, blockHashN1, userSeed, space, numWinners);
    const liveWinners = raw.filter(idx => this.ownerByIndex.has(idx.toString()));

    const prizePool = this.yieldPoolSats;
    const n = BigInt(liveWinners.length);
    const prizePerWinner = n === 0n ? 0n : prizePool / n;
    const paid = prizePerWinner * n;
    this.yieldPoolSats -= paid;

    this.epoch += 1;
    const rec: DrawRecord = {
      epoch: this.epoch,
      winners: liveWinners,
      prizePerWinner,
      yieldAvailable: prizePool,
      paid,
    };
    this.draws.push(rec);
    return { ...rec, winners: [...liveWinners] };
  }

  /** Owner of a share index, or null if burned/never minted. */
  ownerOf(shareIndex: bigint): AccountId | null {
    return this.ownerByIndex.get(shareIndex.toString()) ?? null;
  }

  /**
   * Withdraw full position: return principal, burn shares.
   * Yield already paid out is not clawed back; remaining yield stays in pool.
   */
  withdraw(account: AccountId): { principalSats: bigint } {
    const pos = this.positions.get(account);
    if (!pos) throw new Error('no position');

    for (let i = 0n; i < pos.shareCount; i++) {
      this.ownerByIndex.delete((pos.startIndex + i).toString());
    }
    this.positions.delete(account);
    return { principalSats: pos.principalSats };
  }

  snapshot(): LedgerSnapshot {
    return {
      totalShares: this.totalShares,
      totalPrincipalSats: this.totalPrincipalSats,
      yieldPoolSats: this.yieldPoolSats,
      nextShareIndex: this.nextShareIndex,
      positions: [...this.positions.values()].map(p => ({ ...p })),
      draws: this.draws.map(d => ({ ...d, winners: [...d.winners] })),
      epoch: this.epoch,
    };
  }
}
