contract RecursiveProofAggregator {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Stores aggregated proof commitments on-chain.
        // Each entry represents a batch of inner proofs collapsed into
        // a single recursive proof via Aztec's UltraPlonk backend.
        aggregated_proofs: Map<Field, PublicMutable<Field>>,
        // Tracks the total number of proofs aggregated per submitter
        proof_counts: Map<AztecAddress, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Submits a recursive proof aggregation to the contract.
    /// The batch_id identifies the set of inner proofs being aggregated.
    /// The aggregated_proof_commitment is the Poseidon hash of the
    /// UltraPlonk recursive proof, verifiable without re-executing all inner proofs.
    ///
    /// This enables Whale Network to batch multiple private state transitions
    /// (e.g. 100 WhaleChat messages) into a single on-chain proof,
    /// dramatically reducing gas costs while preserving full privacy.
    #[aztec(private)]
    fn submit_aggregated_proof(
        submitter: AztecAddress,
        batch_id: Field,
        aggregated_proof_commitment: Field,
        inner_proof_count: Field,
    ) {
        RecursiveProofAggregator::at(context.this_address())
            .record_aggregated_proof(submitter, batch_id, aggregated_proof_commitment, inner_proof_count)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn record_aggregated_proof(
        submitter: AztecAddress,
        batch_id: Field,
        proof_commitment: Field,
        inner_count: Field,
    ) {
        storage.aggregated_proofs.at(batch_id).write(proof_commitment);
        let current = storage.proof_counts.at(submitter).read();
        storage.proof_counts.at(submitter).write(current + inner_count);
    }

    #[aztec(public)]
    fn get_aggregated_proof(batch_id: Field) -> Field {
        storage.aggregated_proofs.at(batch_id).read()
    }
}
