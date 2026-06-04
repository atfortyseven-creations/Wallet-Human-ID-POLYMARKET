/// SubNetworkCoordinator — Private Sub-Network State Coordinator
/// 
/// Manages private state coordination between Whale Network sub-nodes.
/// Each node operates a private state channel; this contract coordinates
/// the aggregated public view without revealing individual node data.
contract SentientSubNetwork {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Private state commitments per node operator
        // Represents encrypted health/activity metrics for each sub-node
        node_state_commitments: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public aggregate: total active nodes (count only, no identities)
        active_node_count: PublicMutable<Field>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// A sub-network node privately registers its operational state.
    /// The state_commitment is a Poseidon hash of:
    ///   (uptime_percentage, latency_ms, block_height, node_version)
    /// This allows the network to verify node health without revealing
    /// each node's operational details publicly.
    #[aztec(private)]
    fn register_node_state(operator: AztecAddress, state_commitment: Field) {
        let mut note = ValueNote::new(state_commitment, operator);
        storage.node_state_commitments.at(operator).insert(&mut note, true);

        SentientSubNetwork::at(context.this_address())
            .increment_node_count()
            .enqueue(&mut context);
    }

    /// A node deregisters from the network, nullifying its state note.
    #[aztec(private)]
    fn deregister_node(operator: AztecAddress, state_commitment: Field) {
        dep::value_note::utils::decrement(
            storage.node_state_commitments.at(operator),
            state_commitment,
            operator
        );
        SentientSubNetwork::at(context.this_address())
            .decrement_node_count()
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn increment_node_count() {
        let c = storage.active_node_count.read();
        storage.active_node_count.write(c + 1);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn decrement_node_count() {
        let c = storage.active_node_count.read();
        if c > 0 { storage.active_node_count.write(c - 1); }
    }

    #[aztec(public)]
    fn get_active_node_count() -> Field {
        storage.active_node_count.read()
    }
}
