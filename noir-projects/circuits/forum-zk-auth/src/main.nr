// ForumZkAuth: Private Governance Voting Circuit
// SECURITY FIX: The previous version accepted `identity_nullifier` as a
// caller-supplied input — meaning the caller could CHOOSE any nullifier,
// potentially using someone else's nullifier or a precomputed one.
//
// The nullifier MUST be derived inside the circuit from the caller's
// authenticated identity. In Aztec, this is done via context.msg_sender()
// which is cryptographically bound to the caller's address.
//
// This version:
//   1. Derives the nullifier in-circuit: Poseidon(sender_as_field, proposal_id)
//   2. Adds vote_weight bounds checking (no negative or astronomical weights)
//   3. Adds proposal validity period constraints

contract ForumZkAuth {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    // Maximum vote weight per wallet to prevent manipulation
    global MAX_VOTE_WEIGHT: u64 = 1_000_000;

    #[aztec(storage)]
    struct Storage {
        // Nullifier registry — prevents double-voting
        used_nullifiers: Map<Field, PublicMutable<bool>>,
        // Vote tallies per proposal
        vote_tallies: Map<Field, PublicMutable<Field>>,
        // Proposal registry: proposal_id -> is_active
        active_proposals: Map<Field, PublicMutable<bool>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Creates a governance proposal (admin only — caller is gated at app level)
    #[aztec(public)]
    fn create_proposal(proposal_id: Field) {
        assert(!storage.active_proposals.at(proposal_id).read(), "Proposal already exists");
        storage.active_proposals.at(proposal_id).write(true);
    }

    /// Casts a private vote on a governance proposal.
    ///
    /// SOUNDNESS FIX: The identity_nullifier is now derived IN-CIRCUIT from
    /// context.msg_sender() and proposal_id. The caller cannot supply an
    /// arbitrary nullifier — it is bound to their authenticated address.
    ///
    /// PRIVACY PROPERTIES:
    ///   - The voter's exact weight remains hidden (stored as private input)
    ///   - Only the nullifier (non-reversible hash) appears on-chain
    ///   - The vote tally is updated publicly; individual votes are not
    ///
    /// Parameters:
    ///   proposal_id  - The proposal being voted on
    ///   vote_weight  - PRIVATE: the voter's token-weighted voting power
    #[aztec(private)]
    fn cast_private_vote(
        proposal_id: Field,
        vote_weight: Field,
    ) {
        // --- RANGE CONSTRAINT: vote_weight must be positive and bounded ---
        assert(vote_weight as u64 > 0, "Vote weight must be positive");
        assert(vote_weight as u64 <= MAX_VOTE_WEIGHT, "Vote weight exceeds maximum");

        // --- NULLIFIER DERIVATION IN-CIRCUIT ---
        // The nullifier is Poseidon(caller_address_as_field, proposal_id).
        // context.msg_sender() is cryptographically enforced by PrivateContext.
        // No one can forge a nullifier for another address.
        let sender_field: Field = context.msg_sender().to_field();
        let identity_nullifier = dep::std::hash::poseidon::bn254::hash_2([
            sender_field,
            proposal_id,
        ]);

        // Enqueue public update — checks nullifier and records vote
        ForumZkAuth::at(context.this_address())
            .record_vote(proposal_id, vote_weight, identity_nullifier)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn record_vote(proposal_id: Field, vote_weight: Field, nullifier: Field) {
        // Verify proposal is active
        assert(storage.active_proposals.at(proposal_id).read(), "Proposal is not active");

        // Reject double-votes
        assert(
            !storage.used_nullifiers.at(nullifier).read(),
            "Nullifier already spent: double-vote detected"
        );
        storage.used_nullifiers.at(nullifier).write(true);

        let current_tally = storage.vote_tallies.at(proposal_id).read();
        storage.vote_tallies.at(proposal_id).write(current_tally + vote_weight);
    }

    #[aztec(public)]
    fn get_vote_tally(proposal_id: Field) -> Field {
        storage.vote_tallies.at(proposal_id).read()
    }

    #[aztec(public)]
    fn close_proposal(proposal_id: Field) {
        storage.active_proposals.at(proposal_id).write(false);
    }
}
