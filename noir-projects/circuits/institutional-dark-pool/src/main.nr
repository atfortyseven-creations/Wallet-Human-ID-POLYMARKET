contract InstitutionalDarkPool {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};
    use dep::value_note::utils::{increment, decrement};

    #[aztec(storage)]
    struct Storage {
        // Private order book — orders are hidden until matched
        pending_orders: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public counter of matched trades (amount hidden, count public)
        matched_trade_count: PublicMutable<Field>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Places a private sell/buy order into the dark pool.
    /// The order_commitment is a Pedersen hash of (asset, amount, price, direction).
    /// The full order parameters remain hidden until execution.
    #[aztec(private)]
    fn place_order(
        trader: AztecAddress,
        order_commitment: Field,
    ) {
        let mut note = ValueNote::new(order_commitment, trader);
        storage.pending_orders.at(trader).insert(&mut note, true);
    }

    /// Privately executes a matched pair of buy/sell orders.
    /// Both orders are nullified and a public event is emitted with only
    /// the matched trade count — no amounts, assets, or counterparties revealed.
    #[aztec(private)]
    fn execute_matched_trade(
        buyer: AztecAddress,
        seller: AztecAddress,
        matched_amount: Field,
        buyer_order_commitment: Field,
        seller_order_commitment: Field,
    ) {
        decrement(storage.pending_orders.at(buyer), buyer_order_commitment, buyer);
        decrement(storage.pending_orders.at(seller), seller_order_commitment, seller);

        InstitutionalDarkPool::at(context.this_address())
            .increment_trade_count()
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn increment_trade_count() {
        let current = storage.matched_trade_count.read();
        storage.matched_trade_count.write(current + 1);
    }

    #[aztec(public)]
    fn get_matched_trade_count() -> Field {
        storage.matched_trade_count.read()
    }
}
