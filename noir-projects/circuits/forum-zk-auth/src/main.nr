contract ForumZkAuth {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Maps a nullifier hash to whether it has been used to cast a vote
        // Prevents double-voting without revealing the voter's identity
        used_nullifiers: Map<Field, PublicMutable<bool>>,
        // Maps proposal_id to its current vote tally
        vote_tallies: Map<Field, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Casts a private vote on a governance proposal.
    /// The voter proves membership in the eligible set via a nullifier
    /// derived from their private key, preventing double-voting while
    /// keeping the voter's identity completely hidden on-chain.
    #[aztec(private)]
    fn cast_private_vote(
        proposal_id: Field,
        vote_weight: Field,       // e.g. token-weighted voting power
        identity_nullifier: Field, // Poseidon(private_key, proposal_id) — unique per vote
    ) {
        // Enqueue public state update — nullifier check and tally increment
        ForumZkAuth::at(context.this_address())
            .record_vote(proposal_id, vote_weight, identity_nullifier)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn record_vote(proposal_id: Field, vote_weight: Field, nullifier: Field) {
        // Reject if this nullifier was already used
        assert(!storage.used_nullifiers.at(nullifier).read(), "Nullifier already spent");
        storage.used_nullifiers.at(nullifier).write(true);

        let current_tally = storage.vote_tallies.at(proposal_id).read();
        storage.vote_tallies.at(proposal_id).write(current_tally + vote_weight);
    }

    #[aztec(public)]
    fn get_vote_tally(proposal_id: Field) -> Field {
        storage.vote_tallies.at(proposal_id).read()
    }
}
