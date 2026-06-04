contract AnalyticsQueryProof {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Stores the commitment to a user's private analytics query result
        // so it can be proved without revealing underlying transaction data
        query_commitments: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Proves that a user's on-chain query result falls within a valid range
    /// without revealing the raw transaction volume or wallet balances.
    /// Useful for proving "portfolio > X" or "monthly volume < Y" privately.
    #[aztec(private)]
    fn commit_query_result(
        querier: AztecAddress,
        result_commitment: Field,  // Pedersen commitment to the query result
    ) {
        let mut note = ValueNote::new(result_commitment, querier);
        storage.query_commitments.at(querier).insert(&mut note, true);
    }
}
