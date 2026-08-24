contract RecursiveProofAggregator {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Stores aggregated proof commitments on-chain.
        aggregated_proofs: Map<Field, PublicMutable<Field>>,
        // Tracks the total number of proofs aggregated per submitter
        proof_counts: Map<AztecAddress, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Submits a recursive proof aggregation to the contract.
    ///
    /// SECURITY FIX: The submitter must be the actual caller (context.msg_sender()).
    /// Prevents one user from submitting aggregations attributed to another address.
    #[aztec(private)]
    fn submit_aggregated_proof(
        batch_id: Field,
        aggregated_proof_commitment: Field,
        inner_proof_count: Field,
    ) {
        // Caller is the implicit submitter — enforced by PrivateContext
        let submitter = context.msg_sender();

        // Input validation
        assert(aggregated_proof_commitment != 0, "Invalid proof commitment");
        assert(inner_proof_count as u64 > 0, "inner_proof_count must be > 0");
        assert(inner_proof_count as u64 <= 1024, "inner_proof_count exceeds maximum batch size");

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
        // Batch ID replay guard: prevent overwriting an already-submitted batch
        assert(
            storage.aggregated_proofs.at(batch_id).read() == 0,
            "RecursiveProofAggregator: batch_id already committed"
        );
        storage.aggregated_proofs.at(batch_id).write(proof_commitment);
        let current = storage.proof_counts.at(submitter).read();
        storage.proof_counts.at(submitter).write(current + inner_count);
    }

    #[aztec(public)]
    fn get_aggregated_proof(batch_id: Field) -> Field {
        storage.aggregated_proofs.at(batch_id).read()
    }
}
