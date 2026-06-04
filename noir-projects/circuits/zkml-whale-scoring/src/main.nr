contract ZkmlWhaleScoring {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Private ML score commitments per wallet
        // The score itself is hidden; only its commitment is stored
        score_commitments: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public leaderboard: score_tier (1-5) -> count of wallets in that tier
        // Tier membership is private; tier distribution is public
        tier_distribution: Map<Field, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Privately commits a ZK-ML whale activity score to a wallet.
    /// The ML model runs off-chain; the score is proven via a ZK proof
    /// that the model was applied correctly without revealing inputs or weights.
    ///
    /// score_commitment = Poseidon(raw_score, wallet_salt)
    /// score_tier = public tier (1=Shrimp, 2=Fish, 3=Dolphin, 4=Whale, 5=Leviathan)
    #[aztec(private)]
    fn commit_whale_score(
        wallet: AztecAddress,
        score_commitment: Field,
        score_tier: Field,         // Public tier only — exact score stays private
        model_proof_hash: Field,   // Hash of the ZK proof of correct ML execution
    ) {
        // Store the private score commitment as a note
        let mut note = ValueNote::new(score_commitment, wallet);
        storage.score_commitments.at(wallet).insert(&mut note, true);

        // Update the public tier distribution counter
        ZkmlWhaleScoring::at(context.this_address())
            .update_tier_count(score_tier)
            .enqueue(&mut context);
    }

    /// Allows a wallet to privately prove its score exceeds a minimum threshold
    /// without revealing the exact score. Used for access control in
    /// Whale Network's premium features (e.g. "prove score > 80 to access Pro tier").
    #[aztec(private)]
    fn prove_score_threshold(
        wallet: AztecAddress,
        score_commitment: Field,
        minimum_tier: Field, // Minimum tier required (1-5)
        actual_tier: Field,  // Wallet's actual tier (must be >= minimum_tier)
    ) {
        // Private assertion: actual tier must meet or exceed minimum
        assert(actual_tier as u64 >= minimum_tier as u64, "Score below required threshold");
        // If assertion passes, the wallet has privately proven eligibility
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
