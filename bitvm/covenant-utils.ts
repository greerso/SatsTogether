// SatsTogether Covenant Utilities
//
// PROTOTYPE MOCK / UNIMPLEMENTED — no real on-chain covenant detection or
// migration happens here. This file exists only to unblock compilation of
// scripts/covenant-migration.ts.

export const VERSION = '0.1.0-prototype';

export interface CovenantStatus {
  ctv: boolean; // OP_CHECKTEMPLATEVERIFY (BIP-119) activation
  cat: boolean; // OP_CHECKSIGFROMSTACK-based covenants (CAT revival)
}

export interface CovenantMigrationResult {
  proof: string;
}

// UNIMPLEMENTED: real on-chain covenant activation detection (soft-fork
// deployment status via node RPC / consensus rules) is not implemented.
// Always reports both as inactive.
export async function checkCovenantStatus(): Promise<CovenantStatus> {
  return { ctv: false, cat: false };
}

// UNIMPLEMENTED: no real on-chain migration occurs. This returns a mock,
// clearly-labeled proof string only. A production implementation must
// construct and broadcast an actual covenant-restricted output migration —
// and must branch on which opcode activated, since OP_CTV and OP_CAT enable
// different covenant constructions (this mock treats them identically).
export async function migrateToCovenants(
  poolState: unknown,
  opts: { principalVault: boolean }
): Promise<CovenantMigrationResult> {
  return { proof: 'MOCK-UNIMPLEMENTED-COVENANT-MIGRATION-PROOF' };
}
