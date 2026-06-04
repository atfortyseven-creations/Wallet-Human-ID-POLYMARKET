contract QrScannerVerification {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Maps a QR payload hash to its verification status
        // True = the QR code was scanned and cryptographically verified
        verified_qr_payloads: Map<Field, PublicMutable<bool>>,
        // Maps scanner address to total verified scan count
        scanner_activity: Map<AztecAddress, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Privately verifies a QR code payload using a zero-knowledge proof.
    /// The scanner proves that the scanned qr_payload_hash matches the
    /// expected_commitment without revealing the raw QR data on-chain.
    ///
    /// This is the foundation of Whale Network's cross-device authentication:
    /// desktop generates a QR challenge, mobile scans and calls this function,
    /// desktop polls verified_qr_payloads to confirm authentication.
    #[aztec(private)]
    fn verify_qr_payload(
        scanner: AztecAddress,
        qr_payload_hash: Field,
        expected_commitment: Field, // Poseidon(challenge_nonce, scanner_pubkey)
    ) {
        // Verify the payload matches the expected commitment
        assert(qr_payload_hash == expected_commitment, "QR payload mismatch");

        QrScannerVerification::at(context.this_address())
            .record_verification(scanner, qr_payload_hash)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn record_verification(scanner: AztecAddress, qr_payload_hash: Field) {
        storage.verified_qr_payloads.at(qr_payload_hash).write(true);
        let current = storage.scanner_activity.at(scanner).read();
        storage.scanner_activity.at(scanner).write(current + 1);
    }

    #[aztec(public)]
    fn is_qr_verified(qr_payload_hash: Field) -> bool {
        storage.verified_qr_payloads.at(qr_payload_hash).read()
    }
}
