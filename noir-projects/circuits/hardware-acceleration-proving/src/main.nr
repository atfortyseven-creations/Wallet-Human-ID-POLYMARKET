contract HardwareAccelerationProving {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable
    };

    #[aztec(storage)]
    struct Storage {
        // Maps a prover's address to their certified hardware attestation commitment
        // This commitment is used to verify that a proof was generated on
        // trusted hardware (e.g. a TEE or HSM), adding an extra trust layer.
        hardware_attestations: Map<AztecAddress, PublicMutable<Field>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Registers a hardware-backed proving attestation for a node operator.
    /// The attestation_commitment is a Pedersen hash of:
    ///   (device_id, firmware_version, public_key, timestamp)
    /// This allows verifiers to check that proofs were generated on
    /// certified hardware without revealing device-specific details.
    #[aztec(private)]
    fn register_hardware_attestation(
        operator: AztecAddress,
        attestation_commitment: Field,
    ) {
        HardwareAccelerationProving::at(context.this_address())
            .write_attestation(operator, attestation_commitment)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn write_attestation(operator: AztecAddress, attestation_commitment: Field) {
        storage.hardware_attestations.at(operator).write(attestation_commitment);
    }

    /// Verifies that a given operator has a registered hardware attestation.
    #[aztec(public)]
    fn verify_attestation_exists(operator: AztecAddress) -> bool {
        storage.hardware_attestations.at(operator).read() != 0
    }
}
