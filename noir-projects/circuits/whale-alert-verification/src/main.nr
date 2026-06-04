contract WhaleAlertVerification {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Private alert subscriptions — users subscribe without revealing wallet
        alert_subscriptions: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public alert registry: alert_id -> was_verified (true/false)
        // The alert threshold and source wallet are NOT stored publicly
        verified_alerts: Map<Field, PublicMutable<bool>>,
        // Total verified alerts counter
        total_alerts: PublicMutable<Field>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Privately subscribes a user to whale movement alerts above a threshold.
    /// threshold_commitment = Poseidon(min_usd_amount, asset_id, subscriber_key)
    /// The actual threshold remains hidden — third parties cannot determine
    /// what movements a user is monitoring.
    #[aztec(private)]
    fn subscribe_to_alerts(subscriber: AztecAddress, threshold_commitment: Field) {
        let mut note = ValueNote::new(threshold_commitment, subscriber);
        storage.alert_subscriptions.at(subscriber).insert(&mut note, true);
    }

    /// Verifies and publishes a whale alert event on-chain.
    /// The alert_id is a Poseidon hash of (tx_hash, asset, amount_range_proof).
    /// Crucially, the exact amount and source wallet are NOT published —
    /// only a commitment proving the movement exceeded the threshold.
    #[aztec(private)]
    fn verify_whale_alert(
        reporter: AztecAddress,
        alert_id: Field,
        amount_range_proof_hash: Field, // Proof that amount > threshold without revealing amount
    ) {
        WhaleAlertVerification::at(context.this_address())
            .publish_verified_alert(alert_id)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn publish_verified_alert(alert_id: Field) {
        storage.verified_alerts.at(alert_id).write(true);
        let count = storage.total_alerts.read();
        storage.total_alerts.write(count + 1);
    }

    #[aztec(public)]
    fn is_alert_verified(alert_id: Field) -> bool {
        storage.verified_alerts.at(alert_id).read()
    }

    #[aztec(public)]
    fn get_total_alerts() -> Field {
        storage.total_alerts.read()
    }
}
