/**
 * SatsTogether off-chain share ledger (Phase 1 simulator).
 *
 * Deterministic accounting for deposits → share indices, yield accrual,
 * draw allocation records, and principal withdraws. No chain, no custody, no real BTC.
 *
 * Share model (sim only):
 * - 1 share unit = SATS_PER_SHARE sats of principal (default 1000).
 * - Deposit mints share indices; top-ups append new segments (may be non-contiguous).
 * - Withdraw burns all segments and returns principal.
 * - Draw records allocate yield from the pool into DrawRecord (audit sink only);
 *   per-account claim balances are not implemented yet.
 */

import { selectWinners, type Bytes32 } from './draw.ts';

export const VERSION = '0.1.0-prototype';
export const DEFAULT_SATS_PER_SHARE = 1000n;
/**
 * Hard cap on total minted shares per ledger. The `ownerByIndex` map holds one
 * entry per share, so an unbounded mint (deposit or restore) is an OOM/DoS.
 * ponytail: flat per-index map, 1M-entry ceiling; switch to segment-range lookup if this bites.
 */
export const MAX_SHARE_SPACE = 1_000_000n;

export type AccountId = string;

export interface ShareSegment {
  /** Inclusive start index in global share space. */
  startIndex: bigint;
  shareCount: bigint;
}

export interface Position {
  account: AccountId;
  /**
   * First segment start (compat field for UIs). Full ownership is in `segments`.
   * Non-contiguous after top-ups.
   */
  startIndex: bigint;
  /** Total shares across all segments. */
  shareCount: bigint;
  principalSats: bigint;
  /** Mint ranges (top-ups append). */
  segments: ShareSegment[];
}

export interface DrawRecord {
  epoch: number;
  winners: bigint[];
  /** Frozen at draw time: index → account (survives later withdraw). */
  winnerDetails: { index: bigint; account: AccountId }[];
  /** Per live winner share of the pool this epoch (floor division). */
  prizePerWinner: bigint;
  /** Yield pool size before allocation. */
  yieldAvailable: bigint;
  /**
   * Sats removed from the yield pool for this draw (prizePerWinner * winners).
   * Not delivered to accounts yet — sim audit sink only (claim balances = future work).
   */
  allocated: bigint;
  /**
   * Per-account allocation totals this epoch (sum of prizePerWinner for each
   * live winning share owned by the account). Still audit-only — not claimable balances.
   */
  byAccount: Record<string, bigint>;
}

export interface LedgerSnapshot {
  totalShares: bigint;
  totalPrincipalSats: bigint;
  yieldPoolSats: bigint;
  nextShareIndex: bigint;
  positions: Position[];
  draws: DrawRecord[];
  epoch: number;
  /** Claimable yield credits (sim only — not real payout). */
  claimBalances: Record<string, bigint>;
}

function clonePos(p: Position): Position {
  return {
    account: p.account,
    startIndex: p.startIndex,
    shareCount: p.shareCount,
    principalSats: p.principalSats,
    segments: p.segments.map(s => ({ ...s })),
  };
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
  /** Yield credits from draws (audit + claim drain). Not Lightning delivery. */
  private claimBalances = new Map<AccountId, bigint>();

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

  /**
   * Mint shares for an account. Top-up allowed: appends a new segment at the
   * high-water mark (may leave holes if other accounts minted in between).
   */
  deposit(account: AccountId, principalSats: bigint): Position {
    if (!account) throw new Error('account required');
    if (principalSats <= 0n) throw new Error('principalSats must be > 0');
    if (principalSats % this.satsPerShare !== 0n) {
      throw new Error(`principalSats must be a multiple of satsPerShare (${this.satsPerShare})`);
    }

    const shareCount = principalSats / this.satsPerShare;
    if (this.nextShareIndex + shareCount > MAX_SHARE_SPACE) {
      throw new Error(`share space cap ${MAX_SHARE_SPACE} exceeded (prototype guard)`);
    }
    const startIndex = this.nextShareIndex;
    const segment: ShareSegment = { startIndex, shareCount };

    for (let i = 0n; i < shareCount; i++) {
      this.ownerByIndex.set((startIndex + i).toString(), account);
    }
    this.nextShareIndex += shareCount;

    const existing = this.positions.get(account);
    if (existing) {
      existing.segments.push(segment);
      existing.shareCount += shareCount;
      existing.principalSats += principalSats;
      // startIndex stays first mint
      this.positions.set(account, existing);
      return clonePos(existing);
    }

    const pos: Position = {
      account,
      startIndex,
      shareCount,
      principalSats,
      segments: [segment],
    };
    this.positions.set(account, pos);
    return clonePos(pos);
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
   * Burned indices may be selected but are filtered out (no allocation).
   * Allocated sats leave the yield pool; byAccount is credited to claimBalances
   * (sim claim credits — not real BTC delivery).
   * Remainder (yieldPool % liveCount) stays in the pool.
   * Known sim policy: high-water + skip-burned can concentrate prizes under churn.
   */
  draw(
    blockHashN: Bytes32,
    blockHashN1: Bytes32,
    userSeed: Bytes32,
    numWinners: number,
  ): DrawRecord {
    const space = this.nextShareIndex;
    const raw = selectWinners(blockHashN, blockHashN1, userSeed, space, numWinners);
    const liveWinners = raw.filter(idx => this.ownerByIndex.has(idx.toString()));

    const prizePool = this.yieldPoolSats;
    const n = BigInt(liveWinners.length);
    const prizePerWinner = n === 0n ? 0n : prizePool / n;
    const allocated = prizePerWinner * n;
    this.yieldPoolSats -= allocated;

    this.epoch += 1;
    const byAccount: Record<string, bigint> = {};
    const winnerDetails: { index: bigint; account: AccountId }[] = [];
    for (const idx of liveWinners) {
      const owner = this.ownerByIndex.get(idx.toString());
      if (!owner) continue;
      byAccount[owner] = (byAccount[owner] ?? 0n) + prizePerWinner;
      winnerDetails.push({ index: idx, account: owner });
    }
    for (const [acct, amt] of Object.entries(byAccount)) {
      this.claimBalances.set(acct, (this.claimBalances.get(acct) ?? 0n) + amt);
    }
    const rec: DrawRecord = {
      epoch: this.epoch,
      winners: liveWinners,
      winnerDetails,
      prizePerWinner,
      yieldAvailable: prizePool,
      allocated,
      byAccount,
    };
    this.draws.push(rec);
    return {
      ...rec,
      winners: [...liveWinners],
      winnerDetails: winnerDetails.map(w => ({ ...w })),
      byAccount: { ...byAccount },
    };
  }

  claimBalance(account: AccountId): bigint {
    return this.claimBalances.get(account) ?? 0n;
  }

  /**
   * Drain claim credit for an account (sim only).
   * Optional partial amount; default = full balance.
   * Marks yield as "claimed" in the mock — no Lightning / on-chain send.
   */
  claim(account: AccountId, amountSats?: bigint): { claimedSats: bigint; remaining: bigint } {
    if (!account) throw new Error('account required');
    const bal = this.claimBalances.get(account) ?? 0n;
    if (bal <= 0n) throw new Error('no claim balance');
    let take = amountSats === undefined ? bal : amountSats;
    if (take <= 0n) throw new Error('amountSats must be > 0');
    if (take > bal) throw new Error('amountSats exceeds claim balance');
    const remaining = bal - take;
    if (remaining === 0n) this.claimBalances.delete(account);
    else this.claimBalances.set(account, remaining);
    return { claimedSats: take, remaining };
  }

  /** Owner of a share index, or null if burned/never minted. */
  ownerOf(shareIndex: bigint): AccountId | null {
    return this.ownerByIndex.get(shareIndex.toString()) ?? null;
  }

  /**
   * Annotate winner indices with current owners (null if burned after draw — not expected).
   */
  winnersDetail(winners: bigint[]): { index: bigint; account: AccountId | null }[] {
    return winners.map(index => ({ index, account: this.ownerOf(index) }));
  }

  /**
   * Withdraw full position: return principal, burn all segments.
   * Draw allocations are epoch records only; withdraw does not touch them.
   * Remaining yield stays in the pool.
   */
  withdraw(account: AccountId): { principalSats: bigint } {
    const pos = this.positions.get(account);
    if (!pos) throw new Error('no position');

    for (const seg of pos.segments) {
      for (let i = 0n; i < seg.shareCount; i++) {
        this.ownerByIndex.delete((seg.startIndex + i).toString());
      }
    }
    this.positions.delete(account);
    return { principalSats: pos.principalSats };
  }

  snapshot(): LedgerSnapshot {
    const claimBalances: Record<string, bigint> = {};
    for (const [k, v] of this.claimBalances) {
      if (v > 0n) claimBalances[k] = v;
    }
    return {
      totalShares: this.totalShares,
      totalPrincipalSats: this.totalPrincipalSats,
      yieldPoolSats: this.yieldPoolSats,
      nextShareIndex: this.nextShareIndex,
      positions: [...this.positions.values()].map(clonePos),
      draws: this.draws.map(d => ({
        ...d,
        winners: [...d.winners],
        winnerDetails: d.winnerDetails.map(w => ({ ...w })),
        byAccount: { ...d.byAccount },
      })),
      epoch: this.epoch,
      claimBalances,
    };
  }

  /**
   * Restore a ledger from a full snapshot (export/import). Rebuilds ownership map.
   */
  static restore(snap: LedgerSnapshot, satsPerShare: bigint = DEFAULT_SATS_PER_SHARE): ShareLedger {
    const ledger = new ShareLedger(satsPerShare);
    ledger.nextShareIndex = snap.nextShareIndex;
    ledger.yieldPoolSats = snap.yieldPoolSats;
    ledger.epoch = snap.epoch;
    ledger.draws = snap.draws.map(d => ({
      ...d,
      winners: [...d.winners],
      winnerDetails: d.winnerDetails.map(w => ({ ...w })),
      byAccount: { ...d.byAccount },
    }));
    let totalSegShares = 0n;
    for (const p of snap.positions) {
      for (const seg of p.segments) totalSegShares += seg.shareCount;
    }
    if (totalSegShares > MAX_SHARE_SPACE) {
      throw new Error(`share space cap ${MAX_SHARE_SPACE} exceeded (prototype guard)`);
    }
    for (const p of snap.positions) {
      const pos = clonePos(p);
      ledger.positions.set(pos.account, pos);
      for (const seg of pos.segments) {
        for (let i = 0n; i < seg.shareCount; i++) {
          ledger.ownerByIndex.set((seg.startIndex + i).toString(), pos.account);
        }
      }
    }
    for (const [acct, amt] of Object.entries(snap.claimBalances || {})) {
      if (amt > 0n) ledger.claimBalances.set(acct, amt);
    }
    return ledger;
  }
}
