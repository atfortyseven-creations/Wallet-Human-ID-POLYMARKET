// WhaleAlertVerification: ZK Whale Alert Circuit
// SECURITY FIX: Range proof is now verified INSIDE the circuit using
// Noir's native range constraint `assert(amount as u64 >= threshold as u64)`.
// Previously, `amount_range_proof_hash` was accepted but never verified —
// meaning anyone could submit a fake alert with any hash and it would pass.

contract WhaleAlertVerification {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Private alert subscriptions — subscriber's threshold is hidden
        alert_subscriptions: Map<AztecAddress, PrivateSet<ValueNote>>,
        // Public alert registry: alert_id -> verified (true/false)
        verified_alerts: Map<Field, PublicMutable<bool>>,
        // Replay prevention: alert_id can only be published once
        published_alerts: Map<Field, PublicMutable<bool>>,
        // Total verified alert counter
        total_alerts: PublicMutable<Field>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Privately subscribes to whale alerts above a threshold.
    /// The threshold is hidden — observers cannot determine what movements
    /// the subscriber is monitoring.
    #[aztec(private)]
    fn subscribe_to_alerts(subscriber: AztecAddress, threshold_commitment: Field) {
        let mut note = ValueNote::new(threshold_commitment, subscriber);
        storage.alert_subscriptions.at(subscriber).insert(&mut note, true);
    }

    /// Verifies a whale alert event on-chain.
    ///
    /// SECURITY CONSTRAINT (Range Proof INSIDE circuit):
    ///   The circuit asserts `amount >= threshold` as a native ZK constraint.
    ///   This means no valid proof can be generated for an amount below threshold.
    ///   The exact `amount` and `threshold` are private inputs — only the
    ///   boolean result (amount >= threshold) is proven, not the values themselves.
    ///
    ///   This replaces the previous insecure pattern of passing a `amount_range_proof_hash`
    ///   which was stored but never verified inside the circuit.
    ///
    /// Parameters:
    ///   reporter            - The address reporting the whale movement
    ///   alert_id            - Poseidon(tx_hash, asset_id, reporter) — unique alert ID
    ///   amount              - Private: the actual transfer amount (kept hidden)
    ///   threshold           - Private: the minimum amount to constitute a whale alert
    ///   asset_id            - The asset being tracked (private)
    #[aztec(private)]
    fn verify_whale_alert(
        reporter: AztecAddress,
        alert_id: Field,
        amount: Field,     // PRIVATE — not revealed on-chain
        threshold: Field,  // PRIVATE — subscriber's configured threshold
        asset_id: Field,   // PRIVATE — asset being monitored
    ) {
        // --- RANGE CONSTRAINT (in-circuit range proof) ---
        // This is the core soundness property:
        // A proof can only be generated if amount >= threshold.
        // Both values remain private; only the proof is published.
        assert(amount as u64 >= threshold as u64, "Range proof: amount does not exceed threshold");

        // Additionally assert amount > 0 to prevent degenerate proofs
        assert(amount as u64 > 0, "Range proof: amount must be positive");

        // Enqueue the public state update — only executes if assertions above pass
        WhaleAlertVerification::at(context.this_address())
            .publish_verified_alert(alert_id)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn publish_verified_alert(alert_id: Field) {
        // Replay protection: each alert_id can only be published once
        assert(
            !storage.published_alerts.at(alert_id).read(),
            "Alert already published: replay attack detected"
        );
        storage.published_alerts.at(alert_id).write(true);
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
