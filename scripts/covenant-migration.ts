// SatsTogether Covenant Migration (client-side only, user-controlled)
import { checkCovenantStatus, migrateToCovenants } from '../bitvm/covenant-utils';

export const VERSION = '0.1.0-prototype';

interface UserPoolState {
  liquidityBuffer?: number;
  [key: string]: unknown;
}

export async function runCovenantMigration(userPoolState: UserPoolState) {
  const status = await checkCovenantStatus();
  if (!status.ctv && !status.cat) {
    return { migrated: false, reason: 'covenants_not_active' };
  }
  // NOTE: CTV (BIP-119) and CAT-based covenants enable different vault
  // constructions (template-based pre-signed paths vs. signature-introspection
  // scripts). migrateToCovenants currently treats them identically — a real
  // implementation must branch on status.ctv / status.cat and build the
  // construction that's actually active.
  const migrationProof = await migrateToCovenants(userPoolState, { principalVault: true });
  return { migrated: true, proof: migrationProof };
}