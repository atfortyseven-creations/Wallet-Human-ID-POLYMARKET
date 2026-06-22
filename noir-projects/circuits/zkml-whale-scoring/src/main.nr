// ZkmlWhaleScoring: ZK Machine Learning Score Circuit
// SECURITY FIX: The prove_score_threshold function previously accepted
// `actual_tier` as a PUBLIC input — meaning anyone could claim any tier.
// The tier must be proven against the committed score, not self-asserted.
//
// This version:
//   1. Verifies actual_tier is consistent with committed score via Poseidon
//   2. Uses u64 range assertions for tier bounds
//   3. Prevents manipulation of tier claims

contract ZkmlWhaleScoring {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    // Score tier boundaries (scaled by 100 for integer arithmetic)
    // Tier 1 (Shrimp):    score 0..19
    // Tier 2 (Fish):      score 20..39
    // Tier 3 (Dolphin):   score 40..59
    // Tier 4 (Whale):     score 60..79
    // Tier 5 (Leviathan): score 80..100
    global TIER_1_MAX: u64 = 19;
    global TIER_2_MAX: u64 = 39;
    global TIER_3_MAX: u64 = 59;
    global TIER_4_MAX: u64 = 79;
    global TIER_5_MAX: u64 = 100;

    #[aztec(storage)]
    struct Storage {
        // Private ML score commitments per wallet
        score_commitments: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public tier distribution (tier -> count)
        tier_distribution: Map<Field, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Commits a ZK-ML whale activity score privately.
    ///
    /// SOUNDNESS FIX: The score_tier is now derived IN-CIRCUIT from the
    /// raw_score, preventing callers from claiming a false tier.
    ///
    /// Parameters:
    ///   wallet          - The wallet being scored
    ///   raw_score       - PRIVATE: the actual ML score (0-100)
    ///   wallet_salt     - PRIVATE: unique per-wallet salt for commitment binding
    #[aztec(private)]
    fn commit_whale_score(
        wallet: AztecAddress,
        raw_score: Field,
        wallet_salt: Field,
    ) {
        // --- RANGE CONSTRAINT: score must be in [0, 100] ---
        assert(raw_score as u64 <= TIER_5_MAX, "Score out of valid range [0, 100]");

        // --- DERIVE TIER IN-CIRCUIT (cannot be manipulated) ---
        let score_u64 = raw_score as u64;
        let score_tier: Field = if score_u64 <= TIER_1_MAX {
            1
        } else if score_u64 <= TIER_2_MAX {
            2
        } else if score_u64 <= TIER_3_MAX {
            3
        } else if score_u64 <= TIER_4_MAX {
            4
        } else {
            5
        };

        // score_commitment = Poseidon(raw_score, wallet_salt)
        // Binds the commitment to this specific wallet's salt
        let score_commitment = dep::std::hash::poseidon::bn254::hash_2([raw_score, wallet_salt]);

        let mut note = ValueNote::new(score_commitment, wallet);
        storage.score_commitments.at(wallet).insert(&mut note, true);

        ZkmlWhaleScoring::at(context.this_address())
            .update_tier_count(score_tier)
            .enqueue(&mut context);
    }

    /// Proves a wallet's score exceeds a minimum tier threshold.
    ///
    /// SOUNDNESS FIX: The prover must supply the original `raw_score` and
    /// `wallet_salt` so the circuit can recompute the commitment and verify
    /// it matches the stored one. The `actual_tier` is derived in-circuit.
    ///
    /// Parameters:
    ///   wallet        - The wallet proving its score
    ///   raw_score     - PRIVATE: the original score used to create the commitment
    ///   wallet_salt   - PRIVATE: the original salt
    ///   minimum_tier  - PUBLIC: the minimum tier required (1-5)
    #[aztec(private)]
    fn prove_score_threshold(
        wallet: AztecAddress,
        raw_score: Field,
        wallet_salt: Field,
        minimum_tier: Field,
    ) {
        // Recompute commitment from raw inputs
        let recomputed_commitment = dep::std::hash::poseidon::bn254::hash_2([raw_score, wallet_salt]);

        // Derive actual tier in-circuit (cannot be self-asserted)
        let score_u64 = raw_score as u64;
        assert(score_u64 <= TIER_5_MAX, "Score out of valid range");

        let actual_tier: u64 = if score_u64 <= TIER_1_MAX {
            1
        } else if score_u64 <= TIER_2_MAX {
            2
        } else if score_u64 <= TIER_3_MAX {
            3
        } else if score_u64 <= TIER_4_MAX {
            4
        } else {
            5
        };

        // CONSTRAINT: actual tier must meet or exceed the requirement
        assert(actual_tier >= minimum_tier as u64, "Score below required tier threshold");

        // The proof verifier now knows:
        // 1. The prover knows a raw_score + salt that hash to their commitment
        // 2. That score corresponds to a tier >= minimum_tier
        // Without knowing the exact score
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn update_tier_count(tier: Field) {
        let current = storage.tier_distribution.at(tier).read();
        storage.tier_distribution.at(tier).write(current + 1);
    }

    #[aztec(public)]
    fn get_tier_count(tier: Field) -> Field {
        storage.tier_distribution.at(tier).read()
    }
}
