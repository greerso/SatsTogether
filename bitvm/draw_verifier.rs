//! SatsTogether draw verifier — OFF-CHAIN REFERENCE MODEL ONLY.
//!
//! This module models how winning shares are selected from a block-hash
//! seed. It is NOT the BitVM2 circuit and must not be treated as a security
//! boundary. The following are UNIMPLEMENTED design goals, stubbed out
//! below where relevant:
//!   - Commit-reveal of `user_seed` (currently just an opaque input).
//!   - Sourcing `block_hash_n` / `block_hash_n1` from actual Bitcoin blocks.
//!   - The BitVM2 fraud-proof challenge protocol.
//!   - The prover slashing bond.
//!
//! A production version must execute a real SHA-256 (not `placeholder_mix`)
//! inside the BitVM2 circuit over a seed that is committed to before the
//! relevant block hashes are known.

/// NON-cryptographic placeholder mixing function.
///
/// This stands in for the SHA-256 compression that the real BitVM2 circuit
/// would perform. It is NOT collision-resistant and MUST be replaced by a
/// real SHA-256 (or equivalent) before this is used for anything of value.
fn placeholder_mix(input: [u8; 32], counter: u32) -> [u8; 32] {
    let mut state = input;
    let counter_bytes = counter.to_le_bytes();
    for (i, byte) in state.iter_mut().enumerate() {
        *byte = byte
            .wrapping_add(counter_bytes[i % 4])
            .wrapping_mul(31)
            .rotate_left((i as u32 % 7) + 1)
            ^ (i as u8);
    }
    state
}

/// Selects winning share indices for a draw.
///
/// Off-chain reference model: combines the two block hashes and the user
/// seed by byte-wise XOR, then repeatedly mixes with `placeholder_mix` to
/// derive candidate winners. Rejection sampling removes modulo bias, and
/// duplicates are skipped so each winner is a distinct share index.
///
/// Returns `min(num_winners, total_shares)` distinct indices, each
/// `< total_shares`. Returns an empty vec if `total_shares == 0`.
fn select_winners(
    block_hash_n: [u8; 32],
    block_hash_n1: [u8; 32],
    user_seed: [u8; 32],
    total_shares: u64,
    num_winners: u32,
) -> Vec<u64> {
    if total_shares == 0 {
        return vec![];
    }

    let mut combined = [0u8; 32];
    for i in 0..32 {
        combined[i] = block_hash_n[i] ^ block_hash_n1[i] ^ user_seed[i];
    }

    let target = (num_winners as u64).min(total_shares);
    let mut winners: Vec<u64> = Vec::with_capacity(target as usize);
    let mut seen: std::collections::HashSet<u64> = std::collections::HashSet::with_capacity(target as usize);

    // Reject values in the final incomplete block of the u64 range so the
    // modulo below is unbiased: u64::MAX + 1 isn't generally a multiple of
    // total_shares, so the highest partial bucket must be discarded.
    let limit = u64::MAX - (u64::MAX % total_shares);

    let max_attempts = 10_000u32.max((target as u32).saturating_mul(100));
    let mut counter: u32 = 0;
    let mut attempts: u32 = 0;

    while (winners.len() as u64) < target && attempts < max_attempts {
        let mixed = placeholder_mix(combined, counter);
        counter = counter.wrapping_add(1);
        attempts += 1;

        let candidate = u64::from_le_bytes(mixed[0..8].try_into().unwrap());

        if candidate >= limit {
            continue; // rejected: would bias the modulo below
        }

        let index = candidate % total_shares;
        if seen.insert(index) {
            winners.push(index); // O(1) dedup via the set, order preserved by the vec
        }
    }

    winners
}

// --- Fraud-proof challenge / slashing: UNIMPLEMENTED ---
//
// Intended protocol (not implemented here):
//   - Any party observes the BitVM2 circuit's committed execution trace and
//     the on-chain `StateProof` it produced.
//   - `challenge_fraud` would verify the trace against the proof and, on
//     mismatch, initiate the BitVM2 bisection/challenge-response game.
//   - A prover found to have submitted an invalid proof would have their
//     bonded collateral slashed via `slash_prover`.
//
// fn challenge_fraud(proof: StateProof) -> bool {
//     unimplemented!("BitVM2 fraud-proof challenge protocol is not implemented")
// }
//
// fn slash_prover(prover: ProverId) {
//     unimplemented!("prover slashing bond is not implemented")
// }

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_hashes() -> ([u8; 32], [u8; 32], [u8; 32]) {
        let mut a = [0u8; 32];
        let mut b = [0u8; 32];
        let mut c = [0u8; 32];
        for i in 0..32 {
            a[i] = i as u8;
            b[i] = (i * 3) as u8;
            c[i] = (i * 7 + 1) as u8;
        }
        (a, b, c)
    }

    #[test]
    fn no_duplicate_winners() {
        let (a, b, c) = sample_hashes();
        let winners = select_winners(a, b, c, 1000, 20);
        let mut seen = std::collections::HashSet::new();
        for w in &winners {
            assert!(seen.insert(w), "duplicate winner index: {}", w);
        }
    }

    #[test]
    fn zero_total_shares_returns_empty_no_panic() {
        let (a, b, c) = sample_hashes();
        let winners = select_winners(a, b, c, 0, 5);
        assert!(winners.is_empty());
    }

    #[test]
    fn more_winners_requested_than_shares_caps_at_total_shares() {
        let (a, b, c) = sample_hashes();
        let winners = select_winners(a, b, c, 5, 50);
        assert_eq!(winners.len(), 5);
    }

    #[test]
    fn all_indices_within_bounds() {
        let (a, b, c) = sample_hashes();
        let total_shares = 777;
        let winners = select_winners(a, b, c, total_shares, 30);
        for w in &winners {
            assert!(*w < total_shares);
        }
    }
}
